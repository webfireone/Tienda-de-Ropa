import * as XLSX from "xlsx"
const wb = XLSX.utils.book_new()
const ws = XLSX.utils.json_to_sheet([{ test: 1 }])
XLSX.utils.book_append_sheet(wb, ws, "Test")
const arr = XLSX.write(wb, { type: "array", bookType: "xlsx" })
console.log("write type:", typeof arr, "constructor:", arr?.constructor?.name, "length:", arr?.length)
console.log("byteLength:", arr?.byteLength)
const blob = new Blob([arr], { type: "application/octet-stream" })
console.log("blob size:", blob.size)
