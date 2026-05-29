export const QueryKey = {
  dashboard: {
    data: 'dashboardData',
  },
  users: {
    list: 'usersList',
    detail: 'usersDetail',
  },
  courses: {
    list: 'coursesList',
    detail: 'coursesDetail',
  },
  codes: {
    list: 'codesList',
    detail: 'codesDetail',
  },
  achievements: {
    list: 'achievementsList',
    detail: 'achievementsDetail',
  },
  periods: {
    list: 'periodsList',
    detail: 'periodsDetail',
  },
  assignments: {
    list: 'assignmentsList',
    detail: 'assignmentsDetail',
  },
  groups: {
    list: 'groupsList',
    detail: 'groupsDetail',
  },
  companies: {
    list: 'companiesList',
    detail: 'companiesDetail',
  },
  internships: {
    confirmations: {
      list: 'internshipConfirmationsList',
      detail: 'internshipConfirmationsDetail',
    },
    noCompany: {
      list: 'internshipNoCompanyList',
      detail: 'internshipNoCompanyDetail',
    },
  },
  topics: {
    list: 'topicsList',
    detail: 'topicsDetail',
  },
} as const;
