import type { ReactNode } from "react";

type Props = {
  headers: string[];
  rows: (string | ReactNode)[][];
  rowClasses?: string[];
};

export default function Table({ headers, rows, rowClasses = [] }: Props) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={rowClasses[i] || ""}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
