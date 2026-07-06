import GradesClient from './GradesClient'

export default async function CouncilGradesPage({ params }: { params: Promise<{ councilId: string }> }) {
  const { councilId } = await params

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Xem bảng điểm Hội đồng</h1>
        <p className="text-sm text-gray-600">Xem toàn bộ điểm của sinh viên trong hội đồng (dành cho trưởng/ thư ký)</p>
      </div>
      <GradesClient councilId={councilId} />
    </div>
  )
}
