import { Library, FileText, Wallet, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";
import img from "../../assets/WhatsApp Image 2025-04-10 at 18.53.07_53f9828d.jpg";
import BooksFetchPageInner from "./book/fetchAllAvailableBooks";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const UserLanding: React.FC = () => {
  // Create a ref for the BooksFetchPageInner section
  const booksSectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.User);
  const scrollToBooksSection = () => {
    booksSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-zinc-700">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.75 }}
        className="mx-8 mt-10"
      >
        <div className="relative bg-black text-white rounded-2xl overflow-hidden md:h-[500px]">
          {/* Background Image */}
          <div className="absolute inset-0  opacity-40">
            <img
              src={img}
              alt="Library interior"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="relative  max-w-6xl mx-auto px-4 py-16 md:py-24">
            <div className="max-w-xl">
              <motion.h1
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Welcome to BookBack World
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-lg mb-6"
              >
                Your community destination for lifelong learning, innovation,
                and connection.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="flex space-x-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-blue-800 px-6 py-2 rounded font-medium hover:bg-gray-100 transition-all duration-500"
                  onClick={scrollToBooksSection}
                >
                  Get All Available Books
                </motion.button>
                {user ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-transparent border border-white text-white px-6 py-2 rounded font-medium hover:bg-gray-800 transition-all duration-500"
                    onClick={() => navigate(`/books`)}
                  >
                    My Books List
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-transparent border border-white text-white px-6 py-2 rounded font-medium hover:bg-gray-800 transition-all duration-500"
                    onClick={() => navigate(`/login`)}
                  >
                    Login For Explore More Books
                  </motion.button>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Links */}
      {user &&
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
        className="bg-white py-8"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: <Library size={32} className="text-zinc-700 mb-2" />,
                text: "Your Rental Ownerships",
                link: "/rented-books",
              },
              {
                icon: <FileText size={32} className="text-zinc-700 mb-2" />,
                text: "Check User Requests",
                link: "/contract-requests",
              },
              {
                icon: <Wallet size={32} className="text-zinc-700 mb-2" />,
                text: "Explore Purse",
                link: "/purse",
              },
              {
                icon: <ShoppingBag size={32} className="text-zinc-700 mb-2" />,
                text: "Your Sale Ownerships",
                link: "/sold-books",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + index * 0.15,
                }}
                whileHover={{ scale: 1.05, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => navigate(item.link)}
              >
                {item.icon}
                <span className="font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
}
      {/* Books Fetch Section */}
      <motion.div
        ref={booksSectionRef} // Add reference to this section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="w-full scroll-mt-16" // Added scroll-mt to adjust scroll position
      >
        <BooksFetchPageInner />
      </motion.div>
    </div>
  );
};

export default UserLanding;
