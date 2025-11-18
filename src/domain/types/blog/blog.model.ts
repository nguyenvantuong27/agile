import { IUser } from '../user/user.model';

export interface IBlog {
  _id?: string;
  title: string;
  image: string;
  category: string;
  author: IUser | string;
  authorPic: string;
  published_date: string;
  reading_time: string;
  content: string;
  tags: string | string[];
  createdAt?: string;
  updatedAt?: string;
  viewCount: number;
  likeCount?: number;
}
