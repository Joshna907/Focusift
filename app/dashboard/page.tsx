import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const techniques = [
    "Pomodoro Technique",
    "Time Blocking",
    "Deep Work Sessions",
    "2-Minute Rule",
    "Mindful Breaks",
  ];

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-6">
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt="Profile"
              width={50}
              height={50}
              className="rounded-full"
            />
          )}
          <h1 className="text-2xl font-semibold">
            Welcome, {session.user?.name || 'User'}!
          </h1>
        </div>

        <h2 className="text-xl font-bold mb-4 text-blue-700">Suggested Techniques</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {techniques.map((technique, index) => (
            <li key={index}>{technique}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
