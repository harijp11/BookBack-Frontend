
import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react"

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Have questions about BookBack? We're here to help. Reach out to our team using the contact information below.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-black text-white p-3 rounded-full">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Email Us</h3>
                  <p className="text-gray-600 mb-1">For general inquiries:</p>
                  <a href="mailto:bookback017@gmail.com" className="text-black font-medium hover:underline">
                    bookback017@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-black text-white p-3 rounded-full">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Call Us</h3>
                  <p className="text-gray-600 mb-1">Monday to Friday, 9am to 6pm</p>
                  <p className="text-black font-medium">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-black text-white p-3 rounded-full">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Visit Us</h3>
                  <p className="text-gray-600 mb-1">Our main office:</p>
                  <a 
                    href="https://www.google.com/maps?q=Kochi,+Kerala,+India" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-black hover:underline cursor-pointer flex items-center"
                  >
                    <span>BookBack Office, Kochi, Kerala, India</span>
                    <span className="text-xs ml-2 text-blue-600">(Click to view on map)</span>
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-black text-white p-3 rounded-full">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Business Hours</h3>
                  <div className="space-y-1 text-gray-600">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-12 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">How quickly will I receive a response?</h4>
                  <p className="text-gray-600">We typically respond to all inquiries within 24-48 business hours.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Can I track the status of my inquiry?</h4>
                  <p className="text-gray-600">
                    Yes, you'll receive a reference number via email that you can use to check the status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage