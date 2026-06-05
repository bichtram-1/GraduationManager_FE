import GradesClient from './GradesClient'

export default function CouncilGradesPage({ params }: { params: { councilId: string } }) {
  const { councilId } = params

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Điểm - Hội đồng {councilId}</h1>
        <p className="text-sm text-gray-600">Xem toàn bộ điểm của sinh viên trong hội đồng (dành cho trưởng/ thư ký)</p>
      </div>
      <GradesClient councilId={councilId} />
    </div>
  )
}
