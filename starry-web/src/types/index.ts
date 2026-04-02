export type Page = 'home' | 'stories' | 'collections' | 'write' | 'settings' | 'profile' | 'article' | 'admin' | 'collection_detail';
export type AuthPage = 'login' | 'register';
export type AdminTab = 'overview' | 'users' | 'articles' | 'comments' | 'activity' | 'reviews' | 'permissions';

export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  cover?: string;
  bio: string;
  email?: string;
  qq?: string;
  github?: string;
}

export interface Collection {
  id: number;
  title: string;
  description: string;
  user: UserInfo;
  count?: number;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  created_at: string;
  user: UserInfo;
  likes_count: number;
  is_liked: boolean;
  collection_id?: number;
  collection?: Collection;
  review_status?: number; // 0: 待审核, 1: 已通过, 2: 已驳回
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: UserInfo;
  likes_count: number;
  is_liked: boolean;
}

export interface ToastMessage {
  msg: string;
  type: 'ok' | 'err';
}
