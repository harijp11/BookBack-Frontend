"use client"

import type React from "react"
import { useState } from "react"
import { Book, Users, Repeat, ShieldCheck, ChevronDown } from "lucide-react"
import { useUserAuth } from "@/hooks/custom/useAuth"
import { useNavigate } from "react-router-dom"

const AboutPage: React.FC = () => {

    const isLoggedIn = useUserAuth()

    const navigate  = useNavigate()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About BookBack</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Connecting book lovers to hard-to-find books through a secure rental and purchase platform.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg mb-4">
                At BookBack, we believe that every book deserves to be read, and every reader deserves access to the
                books they seek.
              </p>
              <p className="text-lg mb-4">
                We've created a platform that connects book owners with readers who are looking for books that aren't
                available in traditional libraries or bookstores.
              </p>
              <p className="text-lg">
                Through our secure rental and sale system, we're building a community of book lovers who share,
                exchange, and preserve literary treasures.
              </p>
            </div>
            <div className="bg-gray-100 p-8 rounded-lg">
              <div className="aspect-w-4 aspect-h-3 bg-gray-200 rounded-lg flex items-center justify-center">
                <Book className="h-24 w-24 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How BookBack Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Book className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Find Rare Books</h3>
              <p>
                Search for books that aren't available in libraries or bookstores. Our platform connects you with
                individual owners who have the books you're looking for.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Repeat className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Rent or Buy</h3>
              <p>
                Choose to rent the book for a specific period or purchase it outright if the owner is willing to sell.
                Negotiate terms directly with the book owner.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Secure Transactions</h3>
              <p>
                Our secure system ensures safe exchanges and returns. Book owners can confidently share their
                collections knowing their books will be returned safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose BookBack</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-black text-white p-2 rounded-md">
                <Book className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Access to Rare Books</h3>
                <p>Find books that aren't available through traditional channels, expanding your reading horizons.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-black text-white p-2 rounded-md">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Community of Book Lovers</h3>
                <p>Connect with fellow bibliophiles who share your passion for reading and literature.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-black text-white p-2 rounded-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Secure Transactions</h3>
                <p>Our platform ensures safe exchanges with verification and secure payment processing.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-black text-white p-2 rounded-md">
                <Repeat className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Flexible Options</h3>
                <p>Choose between renting or buying based on your preferences and the owner's terms.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              {
                question: "How does BookBack ensure the safe return of books?",
                answer:
                  "BookBack uses a secure verification system that tracks the condition of books before and after rental. We also implement a deposit system that is refunded upon safe return of the book in its original condition.",
              },
              {
                question: "What happens if a book is damaged during rental?",
                answer:
                  "If a book is damaged during the rental period, the renter is responsible for compensating the owner based on our fair assessment system. We evaluate the extent of damage and determine appropriate compensation.",
              },
              {
                question: "Can I list my own books on BookBack?",
                answer:
                  "BookBack encourages book owners to list their collections for rental or sale. Simply create an account, verify your identity, and start listing your books with details about their condition and your rental/sale preferences.",
              },
              {
                question: "How are book prices and rental rates determined?",
                answer:
                  "Book owners set their own prices and rental rates based on the book's condition, rarity, and market value. BookBack provides pricing guidelines to help owners set fair rates, but the final decision rests with the book owner.",
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${expandedFaq === index ? "transform rotate-180" : ""}`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Next Book?</h2>
          <p className="text-xl mb-8">Join BookBack today and discover books you won't find anywhere else.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isLoggedIn &&
            <button onClick={()=>navigate("/auth")} className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors">
              Sign Up Now
            </button>
              }
            <button onClick={()=>navigate("/") } className="border border-black px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
              Browse Books
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
