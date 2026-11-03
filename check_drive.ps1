# Get C: drive free space
$cDrive = Get-PSDrive -Name C
Write-Output "C: Free Space: $($cDrive.Free) bytes"
Write-Output "C: Used Space: $($cDrive.Used) bytes"
Write-Output "C: Total Size: $(($cDrive.Free + $cDrive.Used)) bytes"

# Get D: drive free space
$dDrive = Get-PSDrive -Name D
Write-Output "D: Free Space: $($dDrive.Free) bytes"
Write-Output "D: Used Space: $($dDrive.Used) bytes"
Write-Output "D: Total Size: $(($dDrive.Free + $dDrive.Used)) bytes"

# Check page file location
Write-Output ""
Write-Output "=== Pagefile configuration ==="
$pagefileInfo = Get-ComputerInfo -Property "PagingFile*" 2>nul
Write-Output $pagefileInfo