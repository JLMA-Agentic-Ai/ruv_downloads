#!/bin/bash
# lib/parallel.sh - Parallel execution utilities
# Version: 1.0.0

set -euo pipefail

################################################################################
# run_parallel - Execute multiple commands in parallel
#
# Usage: run_parallel COMMAND1 COMMAND2 COMMAND3 ...
# Returns: 0 if all succeed, 1 if any fail
################################################################################
run_parallel() {
  local pids=()
  local commands=("$@")
  local failed=0
  
  # Start all commands in background
  for cmd in "${commands[@]}"; do
    eval "$cmd" &
    pids+=($!)
  done
  
  # Wait for all and collect exit codes
  for pid in "${pids[@]}"; do
    if ! wait "$pid"; then
      failed=$((failed + 1))
    fi
  done
  
  return $failed
}

################################################################################
# run_parallel_with_logging - Execute commands in parallel with separate logs
#
# Usage: run_parallel_with_logging LOG_DIR COMMAND1 COMMAND2 ...
# Returns: 0 if all succeed, number of failures otherwise
################################################################################
run_parallel_with_logging() {
  local log_dir=$1
  shift
  local commands=("$@")
  local pids=()
  local failed=0
  local timestamp=$(date +%Y%m%d_%H%M%S)
  
  mkdir -p "$log_dir"
  
  # Start all commands with logging
  local idx=0
  for cmd in "${commands[@]}"; do
    local log_file="$log_dir/job_${idx}_${timestamp}.log"
    local job_name=$(basename "${cmd%% *}")
    
    echo "[PARALLEL] Starting $job_name (log: $(basename "$log_file"))"
    
    (
      echo "=== Started at $(date -Iseconds) ===" > "$log_file"
      echo "Command: $cmd" >> "$log_file"
      echo "" >> "$log_file"
      
      # Execute and prefix with job name for live terminal feedback if needed
      # but we prefer to keep terminal clean and only show completion
      set +e
      eval "$cmd" >> "$log_file" 2>&1
      local exit_code=$?
      set -e
      
      if [ $exit_code -eq 0 ]; then
        echo "[PARALLEL] ✓ Completed: $job_name"
      else
        echo "[PARALLEL] ⚠ Failed ($exit_code): $job_name"
      fi
      
      echo "" >> "$log_file"
      echo "=== Finished at $(date -Iseconds) with exit code $exit_code ===" >> "$log_file"
      exit $exit_code
    ) &
    pids+=($!)
    idx=$((idx + 1))
  done
  
  # Wait and collect results
  for pid in "${pids[@]}"; do
    if ! wait "$pid"; then
      failed=$((failed + 1))
    fi
  done
  
  return $failed
}

################################################################################
# wait_with_progress - Wait for background jobs with progress indicator
#
# Usage: wait_with_progress PID1 PID2 PID3 ...
# Returns: Number of failed jobs
################################################################################
wait_with_progress() {
  local pids=("$@")
  local total=${#pids[@]}
  local completed=0
  local failed=0
  
  echo "Waiting for $total jobs to complete..."
  
  for pid in "${pids[@]}"; do
    if wait "$pid"; then
      completed=$((completed + 1))
      echo -ne "\rProgress: $completed/$total completed"
    else
      completed=$((completed + 1))
      failed=$((failed + 1))
      echo -ne "\rProgress: $completed/$total completed ($failed failed)"
    fi
  done
  
  echo "" # New line after progress
  
  if [ $failed -eq 0 ]; then
    echo "✓ All jobs completed successfully"
  else
    echo "⚠ $failed job(s) failed"
  fi
  
  return $failed
}

# Export functions
export -f run_parallel
export -f run_parallel_with_logging
export -f wait_with_progress
