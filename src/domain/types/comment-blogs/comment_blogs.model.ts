import { IUser } from '../user/user.model';

export interface ICommentBlog {
  _id?: string;
  blog_id: string;
  user_id: IUser | string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}
