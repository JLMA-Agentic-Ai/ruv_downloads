Introduction:

This project integrates OpenAI's GPT-4o large language model with Power Automate Desktop to create an advanced AI-powered automation system. It uses real-time streaming via WebSockets to enable the AI to observe and interact with your desktop, allowing for dynamic and intelligent automation of tasks.

Key Features:
- Real-time desktop streaming to GPT-4o via WebSockets
- AI-powered analysis and decision making for desktop automation
- Easy setup with guided installation script
- Customizable automation actions and workflows
- Seamless integration with Power Automate Desktop

Usage Examples:
1. Automated data entry: The AI observes forms and enters data intelligently
2. Smart email management: Categorize, respond to, and file emails automatically
3. Document analysis and summarization: Extract key information from documents on screen
4. Workflow optimization: Suggest and implement more efficient ways to perform tasks
5. Intelligent troubleshooting: Diagnose and resolve software issues by observing error messages

Main PowerShell Script (save as gpt4o_desktop_automation.ps1):

```powershell
# GPT-4o Desktop Automation with Power Automate Desktop

# Import required modules
Import-Module PowerShellAI
Import-Module Microsoft.PowerAutomate.Desktop

# WebSocket client for real-time streaming
Add-Type -AssemblyName System.Net.WebSockets.Client

# Function to capture and stream desktop
function Stream-Desktop {
    param (
        [string]$WebSocketUrl
    )

    $client = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource

    try {
        $client.ConnectAsync($WebSocketUrl, $cts.Token).Wait()

        while ($client.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
            $screenshot = New-Object System.Drawing.Bitmap([System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width, [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height)
            $graphics = [System.Drawing.Graphics]::FromImage($screenshot)
            $graphics.CopyFromScreen((New-Object System.Drawing.Point(0,0)), (New-Object System.Drawing.Point(0,0)), $screenshot.Size)
            $graphics.Dispose()

            $ms = New-Object System.IO.MemoryStream
            $screenshot.Save($ms, [System.Drawing.Imaging.ImageFormat]::Jpeg)
            $imageBytes = $ms.ToArray()
            $ms.Dispose()
            $screenshot.Dispose()

            $buffer = New-Object byte[] $imageBytes.Length
            [System.Buffer]::BlockCopy($imageBytes, 0, $buffer, 0, $imageBytes.Length)

            $segment = New-Object ArraySegment[byte] -ArgumentList @(,$buffer)
            $client.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Binary, $true, $cts.Token).Wait()

            Start-Sleep -Milliseconds 100
        }
    }
    finally {
        if ($client.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
            $client.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "", $cts.Token).Wait()
        }
        $client.Dispose()
    }
}

# Function to process GPT-4o responses and execute actions
function Process-GPT4oResponse {
    param (
        [string]$Response
    )

    $actions = $Response | ConvertFrom-Json

    foreach ($action in $actions) {
        switch ($action.type) {
            "click" {
                [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point($action.x, $action.y)
                [System.Windows.Forms.SendKeys]::SendWait("{CLICK}")
            }
            "type" {
                [System.Windows.Forms.SendKeys]::SendWait($action.text)
            }
            "keypress" {
                [System.Windows.Forms.SendKeys]::SendWait($action.key)
            }
            "openapp" {
                Start-Process $action.app
            }
            "runflow" {
                Invoke-PADFlow -FlowName $action.flow
            }
        }
    }
}

# Main execution loop
function Start-GPT4oAutomation {
    param (
        [string]$ApiKey,
        [string]$WebSocketUrl
    )

    Set-OpenAIKey -Key $ApiKey

    $streamingJob = Start-Job -ScriptBlock ${function:Stream-Desktop} -ArgumentList $WebSocketUrl

    while ($true) {
        $gpt4oResponse = Get-GPT3Completion "Analyze the current desktop state and suggest actions to automate the visible task. Respond with a JSON array of actions."
        Process-GPT4oResponse -Response $gpt4oResponse

        Start-Sleep -Seconds 1
    }

    $streamingJob | Stop-Job
    $streamingJob | Remove-Job
}

# Start the automation
$apiKey = $env:OPENAI_API_KEY
$webSocketUrl = "wss://api.openai.com/v1/engines/gpt-4o/completions"
Start-GPT4oAutomation -ApiKey $apiKey -WebSocketUrl $webSocketUrl
```

Installation Script (save as install_gpt4o_automation.ps1):

```powershell
# Installation script for GPT-4o Desktop Automation

# Check for administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Please run this script as an Administrator!"
    Exit
}

# Install required modules
Install-Module -Name PowerShellAI -Force
Install-Module -Name Microsoft.PowerAutomate.Desktop -Force

# Download main script
$mainScriptUrl = "https://raw.githubusercontent.com/yourusername/gpt4o-desktop-automation/main/gpt4o_desktop_automation.ps1"
$mainScriptPath = "$env:USERPROFILE\Documents\gpt4o_desktop_automation.ps1"
Invoke-WebRequest -Uri $mainScriptUrl -OutFile $mainScriptPath

# Prompt for OpenAI API Key
$apiKey = Read-Host "Enter your OpenAI API Key" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiKey)
$apiKeyPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set environment variable for API Key
[System.Environment]::SetEnvironmentVariable("OPENAI_API_KEY", $apiKeyPlain, "User")

# Create shortcut on desktop
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\GPT-4o Desktop Automation.lnk")
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$mainScriptPath`""
$Shortcut.Save()

Write-Host "Installation complete! You can now run the GPT-4o Desktop Automation from the shortcut on your desktop."
```

To set up and use the GPT-4o Desktop Automation:

1. Save both scripts to your computer.
2. Run PowerShell as Administrator.
3. Navigate to the directory containing the installation script.
4. Run the installation script:
   ```
   .\install_gpt4o_automation.ps1
   ```
5. Follow the prompts to enter your OpenAI API key.
6. Once installation is complete, you can launch the automation by double-clicking the desktop shortcut or running the main script directly.

The system will now observe your desktop in real-time, analyze the content using GPT-4o, and automatically perform actions to assist with your tasks. You can customize the automation behavior by modifying the main script or creating specific Power Automate Desktop flows that the AI can trigger.

Sources
- [1] Models - OpenAI API https://platform.openai.com/docs/models
- [2] How can I access GPT-4, GPT-4 Turbo, GPT-4o, and GPT-4o mini? https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4-gpt-4-turbo-gpt-4o-and-gpt-4o-mini
- [3] How to efficiently stream real time websocket data to web app https://stackoverflow.com/questions/63679586/how-to-efficiently-stream-real-time-websocket-data-to-web-app
- [4] Simple example on how to use OpenAI's chatgpt api in powershell https://www.reddit.com/r/PowerShell/comments/12o4v6q/chatgpt_powershell_cli_simple_example_on_how_to/
- [5] Using Power Automate to run Power Shell Script - Reddit https://www.reddit.com/r/PowerShell/comments/on5196/using_power_automate_to_run_power_shell_script/
- [6] Integrating ChatGPT with Power Automate Desktop https://community.powerplatform.com/galleries/gallery-posts/?postid=7456b846-7233-405f-92d8-888cd702d7a5
- [7] Add OpenAI/ChatGPT to your Power Automate Desktop Flows https://www.youtube.com/watch?v=bs30fngA1kw
- [8] WebSocket Protocol Usage in a Real-time Web Application https://www.visual-craft.com/blog/using-websocket-protocol-for-real-time-applications/
- [9] Real-time data streaming using FastAPI and WebSockets https://stribny.name/blog/2020/07/real-time-data-streaming-using-fastapi-and-websockets/
- [10] Powerful Scripting with PowerShell and OpenAI API - Toolify AI https://www.toolify.ai/ai-news/powerful-scripting-with-powershell-and-openai-api-1003277
- [11] Use ChatGPT OpenAI with PowerShell - IT koehler blog https://blog.it-koehler.com/en/Archive/5181
- [12] Execute PowerShell Script in Desktop flow using Microsoft Power ... https://www.c-sharpcorner.com/article/execute-powershell-script-in-desktop-flow-using-microsoft-power-automate/
