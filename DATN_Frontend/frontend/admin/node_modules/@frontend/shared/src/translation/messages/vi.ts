/**
 * Website (next-intl) messages — derived from the shared flat `vi.ts`.
 *
 * - Single source of truth: `../languages/vi.ts`
 * - This file only re-shapes the flat keys into the namespaced structure
 *   that next-intl + the website pages expect.
 * - Placeholder syntax is converted from i18next style `{{name}}`
 *   to ICU style `{name}` so next-intl can interpolate.
 */
import vi from '../languages/vi';

/** Convert i18next placeholders `{{x}}` to ICU placeholders `{x}`. */
const icu = (s: string): string => s.replace(/\{\{(\w+)\}\}/g, '{$1}');

const ViMessages = {
  HomePage: {
    title: 'Chào cậu :)',
    name: 'Tên',
    url: 'Địa chỉ',
    thumbnail: 'Địa chỉ hình thu nhỏ',
    welcomeTitle: icu(vi.user_home_greeting),
    welcomeSubtitle: vi.user_home_welcome_back,
    statsTitle: vi.stats_title,
    statsSubtitle: vi.stats_subtitle,
    activateTitle: vi.activate_title,
    activateSubtitle: vi.activate_subtitle,
    activateDescription: vi.activate_description,
    activatePlaceholder: vi.activate_placeholder,
    activateButton: vi.activate_button,
    rankingTitle: vi.ranking_title,
    rankingSubtitle: vi.user_home_achievement_hint,
    achievementNewbieName: vi.achievement_new_student_name,
    achievementExpertName: vi.achievement_expert_name,
    achievementMasterName: vi.achievement_master_name,
    achievementNeedOneCourse: vi.achievement_new_student_desc,
    achievementNeedTwoCourses: vi.achievement_expert_desc,
    achievementNeedThreeCourses: vi.achievement_master_desc,
    achievementCompleted: vi.achievement_status_achieved,
    achievementCurrent: vi.achievement_status_current,
    achievementRemaining: icu(vi.achievement_remaining),
    courseDescription: vi.achievement_new_student_desc,
    statusNew: vi.achievement_status_achieved,
    statusHot: 'Nâng tầm',
    yourCoursesTitle: vi.your_courses,
    lessonUnit: vi.lesson_unit,
    progressLabel: vi.progress_label,
    completeLabel: vi.complete_btn,
  },
  StatsPage: {
    backButton: vi.back_button,
    personalInfoTitle: vi.personal_info_title,
    editButton: vi.edit_button,
    fullNameLabel: vi.full_name,
    emailLabel: vi.email,
    emailCannotChange: vi.email_cannot_change,
    saveButton: vi.save_btn,
    cancelButton: vi.cancel_btn,
    statsOverviewTitle: vi.stats_overview_title,
    coursesLabel: vi.course,
    completedLabel: vi.completed_label,
    inProgressLabel: vi.progress_in_progress,
    completionProgressLabel: vi.completion_progress_label,
    changePasswordTitle: vi.change_password,
    changePasswordButton: vi.change_password,
    currentPasswordLabel: vi.current_password_label,
    newPasswordLabel: vi.new_password,
    confirmNewPasswordLabel: vi.confirm_new_password_label,
    courseProgressTitle: vi.course_progress_title,
    courseProgressSubtitle: vi.course_progress_subtitle,
    lessonUnit: vi.lesson_unit,
  },
  CoursePage: {
    backButton: vi.back_button,
    lessonCountUnit: vi.lesson_unit,
    lockedLabel: vi.locked_label,
    completeVideoButton: vi.complete_video_button,
    selectLessonTitle: vi.select_lesson_title,
    selectLessonSubtitle: vi.select_lesson_subtitle,
  },
  Header: {
    title: vi.header_title,
    logout: vi.logout,
    login: vi.login,
  },
  Users: {
    title: 'Quản lí người dùng',
    name: 'Tên',
    phone: vi.phone_number,
    username: vi.username,
  },
  Table: {
    list: vi.list,
    action: vi.action,
    add_new_btn: vi.add_new_btn,
    export_to_excel: vi.export_to_excel,
    delete_title: vi.delete_title,
    delete_content: vi.delete_content,
    delete: vi.delete,
    cancel_btn: vi.cancel_btn,
    not_id: vi.not_id,
    showing: vi.showing,
    to: vi.to,
    of: vi.of,
    entries: vi.entries,
  },
  Settings: {
    title: 'Hướng dẫn cài đặt',
    description:
      'Thực hiện theo các bước dưới đây để bảo mật tài khoản và tùy chỉnh sở thích của bạn.',
    steps: {
      step1Title: '1. Mở Hồ sơ của bạn',
      step1Description:
        'Nhấp vào avatar của bạn ở góc trên bên phải để mở cài đặt hồ sơ.',
      step2Title: '2. Chuyển đến Bảo mật',
      step2Description:
        'Trong thanh bên, chọn **Bảo mật** để quản lý mật khẩu, xác thực hai yếu tố và các phiên.',
      step3Title: '3. Cập nhật Mật khẩu',
      step3Description:
        'Nhập mật khẩu hiện tại, sau đó chọn mật khẩu mới và xác nhận.',
      step4Title: '4. Bật Xác thực Hai Yếu tố',
      step4Description:
        'Quét mã QR bằng ứng dụng xác thực của bạn và nhập mã hiển thị.',
    },
    lastUpdated: 'Cập nhật lần cuối: {date}',
  },
} as const;

export default ViMessages;
export type ViMessagesType = typeof ViMessages;
