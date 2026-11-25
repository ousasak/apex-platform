import apiClient from '../api/client'
import { authService } from './authService'
import { projectService } from './projectService'
import { blogService } from './blogService'
import { userService } from './userService'
import { roleService } from './roleService'
import { docService } from './docService'
import { mediaService } from './mediaService'
import { activityLogService } from './activityLogService'
import { approvalService } from './approvalService'
import { settingService } from './settingService'
import { memberService } from './memberService'
import { publicService } from './publicService'
import { portfolioService } from './portfolioService'

// Domain Services
export {
  authService,
  projectService,
  blogService,
  userService,
  roleService,
  docService,
  mediaService,
  activityLogService,
  approvalService,
  settingService,
  memberService,
  publicService,
  portfolioService,
}

// Facade API bundles for clean access
export const authApi = authService

export const publicApi = {
  getUserProfile: userService.getPublicProfile,
  getProfileBlogPosts: userService.getProfileBlogPosts,
  getProfileProjects: userService.getProfileProjects,
  getPublicSeriesPage: publicService.getPublicSeriesPage,
  getPublicCollectionPage: publicService.getPublicCollectionPage,
  getProjects: projectService.getProjects,
  getProject: projectService.getProject,
  getBlogPosts: blogService.getPosts,
  getBlogPost: blogService.getPost,
  getBlogCategories: blogService.getCategories,
  getTeam: publicService.getTeam,
  getTags: publicService.getTags,
  getSettings: settingService.getPublicSettings,
  getStats: publicService.getStats,
  sendContact: publicService.sendContact,
  getDocs: docService.getDocs,
  getDoc: docService.getDoc,
  getDocsNav: docService.getDocsNav,
  getSkills: portfolioService.getSkills,
  getExperiences: portfolioService.getExperiences,
  getServices: portfolioService.getServices,
  getResumeDownloadUrl: portfolioService.getResumeDownloadUrl,
}

export const memberApi = memberService

export const adminApi = {
  getDashboardStats: settingService.getDashboardStats,
  getDashboardActivity: settingService.getDashboardActivity,
  getMyPermissions: settingService.getMyPermissions,
  getStorageStats: settingService.getStorageStats,
  refreshStorageStats: settingService.refreshStorageStats,

  getUsers: userService.getUsers,
  getUser: userService.getUser,
  createUser: userService.createUser,
  updateUser: userService.updateUser,
  deleteUser: userService.deleteUser,
  toggleUserActive: userService.toggleUserActive,
  getUserPermissions: userService.getUserPermissions,
  updateUserPermissions: userService.updateUserPermissions,

  getProjects: projectService.getAdminProjects,
  getProject: projectService.getAdminProject,
  createProject: projectService.createProject,
  updateProject: projectService.updateProject,
  deleteProject: projectService.deleteProject,

  getBlogPosts: blogService.getAdminPosts,
  getBlogPost: blogService.getAdminPost,
  createBlogPost: blogService.createPost,
  updateBlogPost: blogService.updatePost,
  deleteBlogPost: blogService.deletePost,
  getBlogCategories: blogService.getAdminCategories,
  createBlogCategory: blogService.createCategory,
  updateBlogCategory: blogService.updateCategory,
  deleteBlogCategory: blogService.deleteCategory,

  getApplications: publicService.getApplications,
  getApplication: publicService.getApplication,
  updateApplicationStatus: publicService.updateApplicationStatus,

  getMessages: publicService.getMessages,
  getMessage: publicService.getMessage,
  markMessageRead: publicService.markMessageRead,
  deleteMessage: publicService.deleteMessage,

  getTeamMembers: publicService.getTeamMembers,
  createTeamMember: publicService.createTeamMember,
  updateTeamMember: publicService.updateTeamMember,
  deleteTeamMember: publicService.deleteTeamMember,

  getRoles: roleService.getRoles,
  createRole: roleService.createRole,
  updateRole: roleService.updateRole,
  deleteRole: roleService.deleteRole,

  getMedia: mediaService.getMedia,
  uploadMedia: mediaService.uploadMedia,
  deleteMedia: mediaService.deleteMedia,

  getSettings: settingService.getAdminSettings,
  updateSettings: settingService.updateSettings,
  getStorageSettings: settingService.getStorageSettings,

  getApprovalRequests: approvalService.getApprovalRequests,
  approveRequest: approvalService.approveRequest,
  rejectRequest: approvalService.rejectRequest,

  getActivityLogs: activityLogService.getActivityLogs,

  getTags: publicService.getAdminTags,
  createTag: publicService.createTag,
  updateTag: publicService.updateTag,
  deleteTag: publicService.deleteTag,

  search: publicService.adminSearch,

  getDocs: docService.getAdminDocs,
  getAllDocs: docService.getAllAdminDocs,
  getDoc: docService.getAdminDoc,
  createDoc: docService.createDoc,
  updateDoc: docService.updateDoc,
  deleteDoc: docService.deleteDoc,
  reorderDocs: docService.reorderDocs,
  getDocCategories: docService.getDocCategories,
  createDocCategory: docService.createDocCategory,
  renameDocCategory: docService.renameDocCategory,
  deleteDocCategory: docService.deleteDocCategory,

  getDocMenus: docService.getDocMenus,
  getDocMenusFlat: docService.getDocMenusFlat,
  createDocMenu: docService.createDocMenu,
  updateDocMenu: docService.updateDocMenu,
  deleteDocMenu: docService.deleteDocMenu,
  reorderDocMenus: docService.reorderDocMenus,

  getSeries: publicService.getSeries,
  getAssignableSeries: publicService.getAssignableSeries,
  createSeries: publicService.createSeries,
  updateSeries: publicService.updateSeries,
  deleteSeries: publicService.deleteSeries,

  getCollections: publicService.getCollections,
  getAssignableCollections: publicService.getAssignableCollections,
  createCollection: publicService.createCollection,
  updateCollection: publicService.updateCollection,
  deleteCollection: publicService.deleteCollection,

  // Portfolio
  getSkills: portfolioService.getAdminSkills,
  createSkill: portfolioService.createSkill,
  updateSkill: portfolioService.updateSkill,
  deleteSkill: portfolioService.deleteSkill,
  reorderSkills: portfolioService.reorderSkills,
  getExperiences: portfolioService.getAdminExperiences,
  createExperience: portfolioService.createExperience,
  updateExperience: portfolioService.updateExperience,
  deleteExperience: portfolioService.deleteExperience,
  getServices: portfolioService.getAdminServices,
  createService: portfolioService.createService,
  updateService: portfolioService.updateService,
  deleteService: portfolioService.deleteService,
  getResumeStatus: portfolioService.getResumeStatus,
  uploadResume: portfolioService.uploadResume,
}

export default apiClient
