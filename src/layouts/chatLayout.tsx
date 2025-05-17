import React from 'react';
import { useParams } from 'react-router-dom';
import UserList from '@/Components/user/chat/UserList';
import ChatWrapper from '@/Components/user/chat/ChatWrapper';


const ChatLayout: React.FC = () => {
  const { receiverId } = useParams<{ receiverId?: string }>();

  return (
   <div className="flex flex-col md:flex-row min-h-[75vh] bg-gray-50">

      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
        <UserList />
      </div>
      
      <div className="w-full md:w-2/3 lg:w-3/4 flex items-center justify-center bg-white">
        {receiverId ? (
          <ChatWrapper />
        ) : (
          <div className="text-center p-10">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800">Select a conversation</h3>
            <p className="text-gray-500 mt-2">Choose a contact from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;