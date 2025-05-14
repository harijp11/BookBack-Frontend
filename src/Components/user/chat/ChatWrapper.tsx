import { useParams } from 'react-router-dom';
import Chat from './UserChat';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import BookLoadingSpinner from '@/hooks/ui/loading/loading';

const ChatWrapper: React.FC = () => {
  const { receiverId } = useParams<{ receiverId?: string }>();
  const userData = useSelector((state: RootState) => state.user.User);
 
  if (!userData) return <BookLoadingSpinner />;

  const userId = userData._id;
  
  return <Chat userId={userId} receiverId={receiverId || ""} />;
};

export default ChatWrapper;