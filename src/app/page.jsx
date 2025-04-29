import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-center items-center pt-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to Your Learning Management System
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Access courses, track your progress, and improve your skills with
          ease.
        </p>
        <Button className={"border-2 border-gray-300 hover:border-cyan-600  hover:text-cyan-600"} variant="solid" size="lg">
          <Link href={"/auth/signin"}>
            Get Started
          </Link>
        </Button>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 px-6">
        <div className="text-center">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-16 h-16 mx-auto text-cyan-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v12l8-8m-8 8l-8-8"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Engaging Courses
          </h3>
          <p className="text-gray-600">
            Explore a variety of courses designed to help you grow.
          </p>
        </div>
        <div className="text-center">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-16 h-16 mx-auto text-cyan-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6M9 16h6m-3 4v-3m-3-4V7m0 4H7m4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Track Your Progress
          </h3>
          <p className="text-gray-600">
            Monitor your learning journey with advanced tracking tools.
          </p>
        </div>
        <div className="text-center">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-16 h-16 mx-auto text-cyan-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h4m0 0h4m-4 4H12"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Flexible Learning
          </h3>
          <p className="text-gray-600">
            Learn at your own pace, anywhere, anytime.
          </p>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-cyan-600 text-white w-full py-12 mt-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start learning?</h2>
          <p className="text-xl mb-6">
            Join our platform today and unlock endless learning opportunities.
          </p>
          <Button
            variant="solid"
            size="lg"
            className={"border-2 border-gray-400 hover:border-gray-200"}
          >
            <Link href={"/auth/signin"}>
              Get Started Now
            </Link>
          </Button>
        </div>
      </section>

      <footer className="bg-gray-900 text-white w-full py-8 ">
        <div className="text-center">
          <p>&copy; 2025 LMS Platform. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
