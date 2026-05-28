'use client'

      {segment === 'TTTN' ? (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <TeacherCard>
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Sinh viên thực tập</div>
                <div className="text-xs text-slate-500">Theo dõi báo cáo hàng tuần và tình trạng nộp bài</div>
              </div>
              <TeacherPill tone="orange">{filteredTTTN.length} sinh viên</TeacherPill>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 text-left">MSSV</th>
                  <th className="px-5 py-3 text-left">Họ tên</th>
                  <th className="px-5 py-3 text-left">Công ty</th>
                  <th className="px-5 py-3 text-left">Mentor</th>
                  <th className="px-5 py-3 text-left">Báo cáo</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredTTTN.map((student) => (
                  <tr key={student.id} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${selectedTTTN.id === student.id ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-5 py-4 font-medium text-[#1976D2]">{student.id}</td>
                    <td className="px-5 py-4 text-slate-900">{student.name}</td>
                    <td className="px-5 py-4 text-slate-600">{student.company}</td>
                    <td className="px-5 py-4 text-slate-600">
                      <div className="space-y-1">
                        <div className="font-medium text-slate-900">{student.mentor}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500"><Phone className="h-3 w-3" /> {student.phone}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500"><Mail className="h-3 w-3" /> {student.email}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-600">{student.report}</div>
                        <TeacherPill tone={student.status === 'Đã nộp' ? 'green' : 'orange'}>{student.status}</TeacherPill>
                        <div className="text-xs text-slate-500">{student.date}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <TeacherButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => { setSelectedTTTN(student); setReportModal({ open: true, id: student.id, type: 'TTTN' }) }}>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            Xem
                          </span>
                        </TeacherButton>
                        <TeacherButton variant="primary" className="px-3 py-1.5 text-xs" onClick={() => setCommentModal({ open: true, id: student.id, text: comments[student.id] ?? '' })}>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            Nhận xét
                          </span>
                        </TeacherButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TeacherCard>

          <TeacherCard className="space-y-4 p-5">
            <div className="text-sm font-semibold text-slate-900">Xem nhanh sinh viên</div>
            <div className="rounded-3xl bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-4">
              <div className="text-xs text-slate-500">Đang chọn</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{selectedTTTN.name}</div>
              <div className="mt-1 text-sm text-slate-600">{selectedTTTN.company}</div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#1976D2]" /> {selectedTTTN.report} · {selectedTTTN.status}</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#1976D2]" /> {selectedTTTN.phone}</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#1976D2]" /> {selectedTTTN.email}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#1976D2]" /> Mentor: {selectedTTTN.mentor}</div>
                <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Cập nhật: {selectedTTTN.date}</div>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">Kiểm tra 1 sinh viên trễ hạn và gửi nhắc nộp báo cáo.</div>
              <div className="rounded-2xl bg-slate-50 p-4">Nhận xét 2 báo cáo đã nộp vào cuối tuần.</div>
              <div className="rounded-2xl bg-slate-50 p-4">Xem nhanh file báo cáo mới nhất để nhận xét.</div>
            </div>
            {comments[selectedTTTN.id] && (
              <div className="mt-3 rounded-2xl bg-white/85 p-4 text-sm text-slate-700">
                <div className="text-sm font-medium text-slate-900">Nhận xét đã lưu</div>
                <div className="mt-2 text-sm text-slate-600">{comments[selectedTTTN.id]}</div>
              </div>
            )}
            <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><Sparkles className="h-4 w-4 text-[#1976D2]" /> Hành động gợi ý</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <TeacherButton variant="secondary" className="px-3 py-2 text-xs">Gửi nhắc nộp</TeacherButton>
                <TeacherButton variant="primary" className="px-3 py-2 text-xs">Mở chi tiết</TeacherButton>
              </div>
            </div>
          </TeacherCard>
        </div>
      ) : (
            <div className="mt-1 text-sm font-medium text-slate-700">{item.title}</div>
            <div className="mt-2 text-xs text-slate-500">{item.hint}</div>
          </TeacherCard>
        ))}
      </div>

      <section className="mb-5 flex flex-wrap items-center gap-2 rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        {(['TTTN', 'ĐATN'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSegment(item)}
            className={`inline-flex items-center gap-2 rounded-[20px] px-4 py-2.5 text-sm font-medium transition ${segment === item ? 'bg-[#2196F3] text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            {item === 'TTTN' ? <ShieldCheck /> : <Users />}
            {item === 'TTTN' ? 'Sinh viên thực tập' : 'Sinh viên đồ án'}
          </button>
        ))}
        <div className="ml-auto w-full max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm MSSV, tên, công ty, đề tài..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </div>
        </div>
      </section>

      {segment === 'TTTN' ? (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <TeacherCard>
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Sinh viên thực tập</div>
                <div className="text-xs text-slate-500">Theo dõi báo cáo hàng tuần và tình trạng nộp bài</div>
              </div>
              <TeacherPill tone="orange">{filteredTTTN.length} sinh viên</TeacherPill>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 text-left">MSSV</th>
                  <th className="px-5 py-3 text-left">Họ tên</th>
                  <th className="px-5 py-3 text-left">Công ty</th>
                  <th className="px-5 py-3 text-left">Mentor</th>
                  <th className="px-5 py-3 text-left">Báo cáo</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredTTTN.map((student) => (
                  <tr key={student.id} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${selectedTTTN.id === student.id ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-5 py-4 font-medium text-[#1976D2]">{student.id}</td>
                    <td className="px-5 py-4 text-slate-900">{student.name}</td>
                    <td className="px-5 py-4 text-slate-600">{student.company}</td>
                    <td className="px-5 py-4 text-slate-600">
                      <div className="space-y-1">
                        <div className="font-medium text-slate-900">{student.mentor}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500"><Phone className="h-3 w-3" /> {student.phone}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500"><Mail className="h-3 w-3" /> {student.email}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-600">{student.report}</div>
                        <TeacherPill tone={student.status === 'Đã nộp' ? 'green' : 'orange'}>{student.status}</TeacherPill>
                        <div className="text-xs text-slate-500">{student.date}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <TeacherButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => { setSelectedTTTN(student); setReportModal({ open: true, id: student.id, type: 'TTTN' }) }}>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            Xem
                          </span>
                        </TeacherButton>
                        <TeacherButton variant="primary" className="px-3 py-1.5 text-xs" onClick={() => setCommentModal({ open: true, id: student.id, text: comments[student.id] ?? '' })}>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            Nhận xét
                          </span>
                        </TeacherButton>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <TeacherCard>
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Sinh viên đồ án</div>
                <div className="text-xs text-slate-500">Theo dõi nhóm, tiến độ báo cáo và kho mã nguồn</div>
              </div>
              <TeacherPill tone="blue">{filteredDATN.length} nhóm</TeacherPill>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 text-left">Mã nhóm</th>
                  <th className="px-5 py-3 text-left">Tên đề tài</th>
                  <th className="px-5 py-3 text-left">SV</th>
                  <th className="px-5 py-3 text-left">Báo cáo</th>
                  <th className="px-5 py-3 text-left">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredDATN.map((group) => (
                  <tr key={group.group} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${selectedDATN.group === group.group ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-5 py-4 font-medium text-[#1976D2]">{group.group}</td>
                    <td className="px-5 py-4 text-slate-900">{group.topic}</td>
                    <td className="px-5 py-4 text-slate-600">{group.members}</td>
                    <td className="px-5 py-4 text-slate-600">{group.latest}</td>
                    <td className="px-5 py-4">
                      <TeacherPill tone={group.status === 'Đang chấm điểm' ? 'orange' : 'green'}>{group.status}</TeacherPill>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <TeacherButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => { setSelectedDATN(group); setReportModal({ open: true, id: group.group, type: 'DATN' }) }}>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            Xem
                          </span>
                        </TeacherButton>
                        <TeacherButton variant="primary" className="px-3 py-1.5 text-xs" onClick={() => setCommentModal({ open: true, id: group.group, text: comments[group.group] ?? '' })}>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            Nhận xét
                          </span>
                        </TeacherButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TeacherCard>

          <TeacherCard className="space-y-4 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5">
            <div className="text-sm font-semibold text-slate-900">Xem nhanh nhóm</div>
            <div className="rounded-[24px] bg-white/80 p-4">
              <div className="text-xs text-slate-500">Đang chọn</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{selectedDATN.group}</div>
              <div className="mt-1 text-sm text-slate-600">{selectedDATN.topic}</div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#1976D2]" /> {selectedDATN.members} thành viên</div>
                <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#1976D2]" /> {selectedDATN.latest}</div>
                <div className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-[#1976D2]" /> {selectedDATN.github}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#1976D2]" /> Cập nhật: {selectedDATN.date}</div>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-white/80 p-4">Kiểm tra trạng thái GitHub và bản thảo mới nhất của nhóm.</div>
              <div className="rounded-2xl bg-white/80 p-4">Lọc nhóm theo hội đồng hoặc buổi chấm sắp tới.</div>
              <div className="rounded-2xl bg-white/80 p-4">Mở chi tiết nhóm để xem sinh viên và ghi chú.</div>
            </div>
            {comments[selectedDATN.group] && (
              <div className="mt-3 rounded-2xl bg-white/85 p-4 text-sm text-slate-700">
                <div className="text-sm font-medium text-slate-900">Nhận xét đã lưu</div>
                <div className="mt-2 text-sm text-slate-600">{comments[selectedDATN.group]}</div>
              </div>
            )}
            <div className="rounded-[24px] bg-white/85 p-4 ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><Sparkles className="h-4 w-4 text-[#1976D2]" /> Hành động gợi ý</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <TeacherButton variant="secondary" className="px-3 py-2 text-xs">Xem repot</TeacherButton>
                <TeacherButton variant="primary" className="px-3 py-2 text-xs">Nhận xét nhóm</TeacherButton>
              </div>
            </div>
          </TeacherCard>
        </div>
      )}
      {/* Report modal (Xem báo cáo) */}
      {reportModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setReportModal({ open: false, id: undefined, type: undefined })} />
          <div className="relative z-50 w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{reportModal.type === 'TTTN' ? 'Xem báo cáo' : 'Xem báo cáo nhóm'}{reportModal.id ? ` - ${reportModal.type === 'TTTN' ? (TTTN.find(s => s.id === reportModal.id)?.name ?? reportModal.id) : (DATN.find(g => g.group === reportModal.id)?.topic ?? reportModal.id)}` : ''}</h3>
              <button className="text-slate-500" onClick={() => setReportModal({ open: false, id: undefined, type: undefined })}>✕</button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{reportModal.type === 'TTTN' ? (TTTN.find(s => s.id === reportModal.id)?.report ?? 'Báo cáo') : (DATN.find(g => g.group === reportModal.id)?.latest ?? 'Báo cáo nhóm')}</div>
                    <div className="mt-1 text-xs text-slate-500">Ngày nộp: {reportModal.type === 'TTTN' ? (TTTN.find(s => s.id === reportModal.id)?.date ?? '') : (DATN.find(g => g.group === reportModal.id)?.date ?? '')}</div>
                  </div>
                  <div className="text-sm text-slate-500">{reportModal.type === 'TTTN' ? (TTTN.find(s => s.id === reportModal.id)?.status ?? '') : (DATN.find(g => g.group === reportModal.id)?.status ?? '')}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-900">File báo cáo</div>
                <div className="mt-2 rounded-md border border-slate-100 bg-white p-3 text-sm text-slate-700">week3.pdf</div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-900">Nội dung báo cáo</div>
                <div className="mt-2 rounded-md border border-slate-100 bg-white p-4 text-sm text-slate-700">
                  <p className="font-medium">{reportModal.type === 'TTTN' ? (TTTN.find(s => s.id === reportModal.id)?.report ?? '') : (DATN.find(g => g.group === reportModal.id)?.latest ?? '')}</p>
                  <div className="mt-2 text-sm text-slate-600">Mô tả tóm tắt nội dung báo cáo, công việc đã thực hiện và kết quả đạt được. Nội dung này là ví dụ mô tả để hiển thị trong modal xem báo cáo.</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-900">Nhận xét báo cáo (không bắt buộc)</div>
                <textarea
                  value={reportModal.id ? (comments[reportModal.id] ?? '') : ''}
                  onChange={(e) => { if (reportModal.id) setComments(c => ({ ...c, [reportModal.id!]: e.target.value })) }}
                  className="mt-2 h-28 w-full rounded-md border border-slate-200 p-3 text-sm outline-none"
                  placeholder="Nhập nhận xét về báo cáo của sinh viên..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button className="rounded-md px-4 py-2 text-sm" onClick={() => setReportModal({ open: false, id: undefined, type: undefined })}>Đóng</button>
                <button
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
                  onClick={() => setReportModal({ open: false, id: undefined, type: undefined })}
                >
                  Lưu nhận xét
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment modal */}
      {commentModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCommentModal({ open: false, id: undefined, text: '' })} />
          <div className="relative z-50 w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Nhận xét {commentTargetLabel ? `— ${commentTargetLabel}` : ''}</h3>
            <p className="mt-2 text-sm text-slate-600">Ghi nhận nhận xét cho mục được chọn.</p>
            <textarea
              autoFocus
              value={commentModal.text}
              onChange={(e) => setCommentModal((s) => ({ ...s, text: e.target.value }))}
              className="mt-4 h-32 w-full rounded-md border border-slate-200 p-3 text-sm outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md px-4 py-2 text-sm"
                onClick={() => setCommentModal({ open: false, id: undefined, text: '' })}
              >
                Hủy
              </button>
              <button
                type="button"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
                onClick={() => {
                  if (commentModal.id) setComments((c) => ({ ...c, [commentModal.id!]: commentModal.text }))
                  setCommentModal({ open: false, id: undefined, text: '' })
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
