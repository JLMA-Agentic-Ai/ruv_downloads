# RegistryManager.ps1
# Comprehensive script to backup, restore, analyze, and optimize Windows Registry with AI support.

# ===========================
# Configuration
# ===========================

# Path to store registry backups
$BackupDirectory = "$env:USERPROFILE\RegistryBackups"
if (-Not (Test-Path $BackupDirectory)) {
    New-Item -Path $BackupDirectory -ItemType Directory | Out-Null
}

# Path to store AI analysis report
$AIReportPath = "$env:USERPROFILE\RegistryBackups\AI_Registry_Analysis_$((Get-Date).ToString('yyyyMMddHHmmss')).txt"

# ===========================
# Functions
# ===========================

# Function to prompt for confirmation
function Confirm-Action {
    param (
        [string]$Message
    )
    do {
        $choice = Read-Host "$Message (Y/N)"
    } while ($choice -notin @('Y','y','N','n'))
    return $choice -eq 'Y' -or $choice -eq 'y'
}

# Function to backup the entire registry
function Backup-FullRegistry {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $backupPath = "$BackupDirectory\FullRegistryBackup_$timestamp.reg"
    try {
        reg export HKLM $backupPath /y
        reg export HKCU "$BackupDirectory\HKEY_CURRENT_USER_$timestamp.reg" /y
        Write-Output "Full registry backup created at:"
        Write-Output "  HKLM: $backupPath"
        Write-Output "  HKCU: $BackupDirectory\HKEY_CURRENT_USER_$timestamp.reg"
    } catch {
        Write-Error "Failed to backup the registry: $_"
    }
}

# Function to restore the registry from a backup
function Restore-Registry {
    $backupFiles = Get-ChildItem -Path $BackupDirectory -Filter "*.reg" | Select-Object Name
    if ($backupFiles.Count -eq 0) {
        Write-Output "No backup files found in $BackupDirectory."
        return
    }

    Write-Output "Available Backup Files:"
    for ($i=0; $i -lt $backupFiles.Count; $i++) {
        Write-Output "$($i + 1): $($backupFiles[$i].Name)"
    }

    $selection = Read-Host "Enter the number of the backup file you want to restore"
    if ($selection -match '^\d+$' -and $selection -ge 1 -and $selection -le $backupFiles.Count) {
        $selectedFile = $backupFiles[$selection - 1].FullName
        if (Confirm-Action "Are you sure you want to restore the registry from $($backupFiles[$selection - 1].Name)? This may require a system restart.") {
            try {
                reg import $selectedFile
                Write-Output "Registry restored from $selectedFile"
            } catch {
                Write-Error "Failed to restore the registry: $_"
            }
        } else {
            Write-Output "Restore operation cancelled."
        }
    } else {
        Write-Output "Invalid selection."
    }
}

# Function to analyze the registry for common issues
function Analyze-Registry {
    Write-Output "Analyzing registry for common optimization opportunities..."

    # Define registry paths and values to analyze
    $registryAnalysis = @(
        @{
            Name = "Disable Startup Delay"
            Key = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Serialize"
            ValueName = "StartupDelayInMSec"
        },
        @{
            Name = "Disable Animation"
            Key = "HKCU:\Control Panel\Desktop\WindowMetrics"
            ValueName = "MinAnimate"
        },
        @{
            Name = "Enable Fast Boot"
            Key = "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power"
            ValueName = "HiberbootEnabled"
        },
        @{
            Name = "Increase Menu Show Delay"
            Key = "HKCU:\Control Panel\Desktop\WindowMetrics"
            ValueName = "MenuShowDelay"
        },
        @{
            Name = "Disable Telemetry"
            Key = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection"
            ValueName = "AllowTelemetry"
        }
    )

    foreach ($item in $registryAnalysis) {
        Write-Output "`n$item.Name:"
        if (Test-Path $item.Key) {
            $currentValue = (Get-ItemProperty -Path $item.Key -Name $item.ValueName -ErrorAction SilentlyContinue).$($item.ValueName)
            if ($null -ne $currentValue) {
                Write-Output "  Current Value of $($item.ValueName): $currentValue"
            } else {
                Write-Output "  $($item.ValueName) does not exist."
            }
        } else {
            Write-Output "  Registry key $($item.Key) does not exist."
        }
    }

    Write-Output "`nAnalysis Completed."
}

# Function to optimize registry settings
function Optimize-Registry {
    Write-Output "Starting Windows Registry Optimization..."

    # Define registry tweaks
    $registryTweaks = @(
        @{
            Name = "Disable Startup Delay"
            Key = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Serialize"
            ValueName = "StartupDelayInMSec"
            NewValue = 0
            Type = "DWord"
            Description = "Reduces startup delay to speed up boot time."
        },
        @{
            Name = "Disable Animation"
            Key = "HKCU:\Control Panel\Desktop\WindowMetrics"
            ValueName = "MinAnimate"
            NewValue = 0
            Type = "DWord"
            Description = "Disables window animations for better performance."
        },
        @{
            Name = "Enable Fast Boot"
            Key = "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power"
            ValueName = "HiberbootEnabled"
            NewValue = 1
            Type = "DWord"
            Description = "Enables fast startup to reduce boot time."
        },
        @{
            Name = "Increase Menu Show Delay"
            Key = "HKCU:\Control Panel\Desktop\WindowMetrics"
            ValueName = "MenuShowDelay"
            NewValue = 0
            Type = "DWord"
            Description = "Sets menu show delay to minimum for faster menu appearance."
        },
        @{
            Name = "Disable Telemetry"
            Key = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection"
            ValueName = "AllowTelemetry"
            NewValue = 0
            Type = "DWord"
            Description = "Disables Windows telemetry for enhanced privacy and performance."
        }
    )

    foreach ($tweak in $registryTweaks) {
        Write-Output "`nProcessing: $($tweak.Name)"
        try {
            # Backup the registry key before making changes
            $timestamp = Get-Date -Format "yyyyMMddHHmmss"
            $safeName = $tweak.Name -replace ' ', '_'
            $backupPath = "$BackupDirectory\RegistryBackup_$safeName_$timestamp.reg"
            reg export $tweak.Key $backupPath /y
            Write-Output "Backup of $($tweak.Key) created at $backupPath"

            # Ensure the registry key exists
            if (-Not (Test-Path $tweak.Key)) {
                Write-Warning "Registry key $($tweak.Key) does not exist. Creating it."
                New-Item -Path $tweak.Key -Force | Out-Null
            }

            # Get current value
            $currentValue = (Get-ItemProperty -Path $tweak.Key -Name $tweak.ValueName -ErrorAction SilentlyContinue).$($tweak.ValueName)
            if ($null -ne $currentValue) {
                Write-Output "Current value of $($tweak.ValueName): $currentValue"
            } else {
                Write-Output "$($tweak.ValueName) does not exist. It will be created."
            }

            # Confirm with user before making changes
            if (Confirm-Action "Do you want to change $($tweak.ValueName) to $($tweak.NewValue)?") {
                Set-ItemProperty -Path $tweak.Key -Name $tweak.ValueName -Value $tweak.NewValue -Type $tweak.Type
                Write-Output "$($tweak.ValueName) set to $($tweak.NewValue)"
            } else {
                Write-Output "Skipped changing $($tweak.ValueName)"
            }
        } catch {
            Write-Error "Error processing $($tweak.Name): $_"
        }
    }

    Write-Output "`nRegistry Optimization Completed."
}

# Function to perform AI-powered analysis using OpenAI GPT-4
function AI-Powered-Analysis {
    Write-Output "Starting AI-Powered Registry Analysis..."

    # Retrieve OpenAI API Key
    $apiKey = $env:OPENAI_API_KEY
    if (-Not $apiKey) {
        # Attempt to read from a secure file
        $apiKeyPath = "C:\Scripts\OpenAI_API_Key.txt"
        if (Test-Path $apiKeyPath) {
            $apiKey = Get-Content -Path $apiKeyPath -Raw
        } else {
            Write-Error "OpenAI API key not found. Please set the OPENAI_API_KEY environment variable or place the key in C:\Scripts\OpenAI_API_Key.txt"
            return
        }
    }

    # Collect registry data for analysis
    $registryData = ""
    $registryKeys = @(
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Serialize",
        "HKCU:\Control Panel\Desktop\WindowMetrics",
        "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power",
        "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection"
    )

    foreach ($key in $registryKeys) {
        if (Test-Path $key) {
            $properties = Get-ItemProperty -Path $key
            $registryData += "`n$key`n"
            foreach ($prop in $properties.PSObject.Properties) {
                $registryData += "$($prop.Name) = $($prop.Value)`n"
            }
        } else {
            $registryData += "`n$key does not exist.`n"
        }
    }

    # Prepare the prompt for GPT-4
    $prompt = @"
You are an expert system optimizer. Analyze the following Windows Registry settings and provide recommendations for improving performance, energy efficiency, security, and overall system stability. Explain each recommendation in detail.

Registry Settings:
$registryData

Provide your analysis below.
"@

    # Prepare the API request
    $requestBody = @{
        model = "gpt-4"
        prompt = $prompt
        max_tokens = 1500
        temperature = 0.5
    } | ConvertTo-Json

    # Send the request to OpenAI API
    try {
        $response = Invoke-RestMethod -Uri "https://api.openai.com/v1/chat/completions" `
                                      -Method Post `
                                      -Headers @{
                                          "Content-Type"  = "application/json"
                                          "Authorization" = "Bearer $apiKey"
                                      } `
                                      -Body (${
                                          @{
                                              model = "gpt-4"
                                              messages = @(@{role = "system"; content = "You are ChatGPT, a large language model trained by OpenAI."},
                                                           @{role = "user"; content = $prompt})
                                              max_tokens = 1500
                                              temperature = 0.5
                                          } | ConvertTo-Json
                                      })

        $aiResponse = $response.choices[0].message.content
        # Save the AI analysis to a file
        $aiResponse | Out-File -FilePath $AIReportPath -Encoding UTF8
        Write-Output "AI analysis completed. Report saved at $AIReportPath"
    } catch {
        Write-Error "Failed to communicate with OpenAI API: $_"
    }
}

# Function to display the menu and handle user input
function Show-Menu {
    Clear-Host
    Write-Output "=============================="
    Write-Output "   Windows Registry Manager"
    Write-Output "=============================="
    Write-Output "1. Backup Registry"
    Write-Output "2. Restore Registry"
    Write-Output "3. Analyze Registry"
    Write-Output "4. Optimize Registry"
    Write-Output "5. AI-Powered Analysis"
    Write-Output "6. Exit"
}

# ===========================
# Main Execution Loop
# ===========================

do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-6)"
    switch ($choice) {
        '1' {
            Backup-FullRegistry
            Pause
        }
        '2' {
            Restore-Registry
            Pause
        }
        '3' {
            Analyze-Registry
            Pause
        }
        '4' {
            Optimize-Registry
            Pause
        }
        '5' {
            AI-Powered-Analysis
            Pause
        }
        '6' {
            Write-Output "Exiting Registry Manager."
            break
        }
        default {
            Write-Output "Invalid choice. Please select a valid option."
            Pause
        }
    }
} while ($true)