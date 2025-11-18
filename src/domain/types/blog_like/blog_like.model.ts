import { IBlog } from '../blog/blog.model';
import { IUser } from '../user/user.model';

export interface IBlogLike {
  _id?: string;
  blog_id: IBlog;
  user_id: IUser;
}
