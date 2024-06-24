export interface IMessage {
  id: number;
  text: string;
  sender: string;
  fileId?: string
};

export interface IChat {
  id: string;
  users: string[];
  messages: IMessage[];
  unread: string | boolean
};
  
export interface IUser {
  id: string;
  userName: string;
  email: string
}
