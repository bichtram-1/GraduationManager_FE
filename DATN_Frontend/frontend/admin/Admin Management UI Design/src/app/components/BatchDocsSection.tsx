import { FolderOpen, Download, FileText, FileSpreadsheet } from "lucide-react";
import { SAMPLE_BATCH_DOCS } from "./BatchDetail";

const fileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return { Icon: FileText, color: "text-[#DC2626]" };
  if (ext === "docx" || ext === "doc") return { Icon: FileText, color: "text-[#2563EB]" };
  if (ext === "xlsx" || ext === "xls") return { Icon: FileSpreadsheet, color: "text-[#16A34A]" };
  return { Icon: FileText, color: "text-gray-500" };
};

export function BatchDocsSection({
  title = "Tài liệu đợt TTTN HK2/2025-2026",
  audience,
}: {
  title?: string;
  audience: "teacher" | "student";
}) {
  const docs = SAMPLE_BATCH_DOCS.filter((d) => d.audience === "all" || d.audience === audience);

  return (
    <div className="mt-6 rounded-lg border border-dashed border-[#CBD5E1] p-4 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <FolderOpen className="w-4 h-4 text-[#64748B]" />
        <span className="text-sm">{title}</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs">
          {docs.length} file
        </span>
      </div>
      <div>
        {docs.map((d) => {
          const { Icon, color } = fileIcon(d.name);
          return (
            <div
              key={d.id}
              className="flex items-center gap-3 py-2.5 border-b last:border-b-0 border-[#F1F5F9]"
              style={{ minHeight: 44 }}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{d.name}</div>
              </div>
              <div className="text-xs text-gray-500 hidden sm:block">Admin · {d.date}</div>
              <button className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-[#2563EB] text-[#2563EB] text-xs hover:bg-[#EFF6FF]">
                <Download className="w-3.5 h-3.5" />
                Tải về
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
