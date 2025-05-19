import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import UserList from '@/Components/user/chat/UserList';
import ChatWrapper from '@/Components/user/chat/ChatWrapper';
import ChatToggleButton from '@/Components/user/chat/chatToggleButton';

const ChatLayout: React.FC = () => {
  const { receiverId } = useParams<{ receiverId?: string }>();
  const [isMobileUserListOpen, setIsMobileUserListOpen] = useState(false);

  const toggleUserList = () => {
    setIsMobileUserListOpen(!isMobileUserListOpen);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 relative">
      {/* Mobile toggle button */}
      <ChatToggleButton 
        isOpen={isMobileUserListOpen} 
        onClick={toggleUserList} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* User list - Hidden on mobile by default, shown when toggled */}
        <div 
          className={`
            absolute md:relative w-full h-[80vh] md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 shadow-sm 
            transition-transform duration-300 ease-in-out
            ${isMobileUserListOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <UserList onClose={setIsMobileUserListOpen}/>
        </div>
        
        {/* Chat area */}
        <div className="w-full md:w-2/3 lg:w-3/4 flex">
          {receiverId ? (
            <ChatWrapper />
          ) : (
            <div className="w-full flex items-center justify-center bg-white p-4">
              <div className="text-center p-8">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-800">Select a conversation</h3>
                <p className="text-gray-500 mt-2">Choose a contact from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;