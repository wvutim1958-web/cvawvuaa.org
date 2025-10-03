# Calculate Total Payments Per Member
# Process the CSV file and group transactions by customer name

# Read the CSV file
$csvPath = "customer-transactions-complete.csv"
$transactions = Import-Csv $csvPath

# Create a hashtable to store totals per customer
$customerTotals = @{}
$customerDetails = @{}

# Process each transaction
foreach ($transaction in $transactions) {
    $customerName = $transaction.'Customer Name'
    $amountString = $transaction.'Last Transaction Amount'
    
    # Extract numeric value from amount (remove $ and USD)
    $amount = 0
    if ($amountString -match '\$(\d+\.?\d*)') {
        $amount = [decimal]$matches[1]
    }
    
    # Add to customer total
    if ($customerTotals.ContainsKey($customerName)) {
        $customerTotals[$customerName] += $amount
        $customerDetails[$customerName].TransactionCount++
        # Update latest transaction date
        $customerDetails[$customerName].LatestDate = $transaction.'Last Transaction Date'
    } else {
        $customerTotals[$customerName] = $amount
        $customerDetails[$customerName] = @{
            Email = $transaction.'Email Address'
            Address = $transaction.'Delivery Address'
            TransactionCount = 1
            LatestDate = $transaction.'Last Transaction Date'
        }
    }
}

# Create summary report
$summaryReport = @()
foreach ($customer in $customerTotals.Keys | Sort-Object) {
    $summaryReport += [PSCustomObject]@{
        'Customer Name' = $customer
        'Total Paid' = "`${0:F2}" -f $customerTotals[$customer]
        'Number of Transactions' = $customerDetails[$customer].TransactionCount
        'Latest Transaction Date' = $customerDetails[$customer].LatestDate
        'Email Address' = $customerDetails[$customer].Email
        'Delivery Address' = $customerDetails[$customer].Address
    }
}

# Export to CSV
$summaryReport | Export-Csv "customer-payment-totals.csv" -NoTypeInformation

# Display summary statistics
Write-Host "=== PAYMENT SUMMARY REPORT ===" -ForegroundColor Green
Write-Host ""
Write-Host "Total Customers: $($summaryReport.Count)" -ForegroundColor Yellow

# Calculate total revenue
$totalRevenue = 0
foreach ($customer in $summaryReport) {
    $amount = [decimal]($customer.'Total Paid' -replace '[\$,]', '')
    $totalRevenue += $amount
}
Write-Host "Total Revenue: `$$totalRevenue" -ForegroundColor Yellow
Write-Host ""

# Show top 10 customers by total payment
Write-Host "=== TOP 10 CUSTOMERS BY TOTAL PAYMENT ===" -ForegroundColor Green
$summaryReport | Sort-Object { [decimal]($_.'Total Paid' -replace '[\$,]', '') } -Descending | Select-Object -First 10 | Format-Table -AutoSize

# Show customers with multiple transactions
Write-Host "=== CUSTOMERS WITH MULTIPLE TRANSACTIONS ===" -ForegroundColor Green
$summaryReport | Where-Object { $_.'Number of Transactions' -gt 1 } | Sort-Object { [int]$_.'Number of Transactions' } -Descending | Format-Table -AutoSize

Write-Host ""
Write-Host "Complete report saved to: customer-payment-totals.csv" -ForegroundColor Green