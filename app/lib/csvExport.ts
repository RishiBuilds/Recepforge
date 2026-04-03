/* CSV Export Utility */

type CsvColumn<T> = {
  header: string;
  accessor: (item: T) => string | number | undefined | null;
};

export function generateCsv<T>(data: T[], columns: CsvColumn<T>[]): string {
  const escapeCell = (value: string | number | undefined | null): string => {
    const str = value == null ? "" : String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = columns.map((col) => escapeCell(col.header)).join(",");

  const dataRows = data.map((item) =>
    columns.map((col) => escapeCell(col.accessor(item))).join(",")
  );

  return [headerRow, ...dataRows].join("\n");
}

export function downloadCsv(csvContent: string, filename: string): void {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function exportToCsv<T>(
  data: T[],
  columns: CsvColumn<T>[],
  filename: string
): void {
  const csv = generateCsv(data, columns);
  downloadCsv(csv, filename);
}
