// app/page.tsx
import ImageUploadAndComments from '../components/ImageUploadAndComments';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4">
      <h1 className="text-4xl font-bold mb-8">Next.js 14 Image Upload with Comments</h1>
      <ImageUploadAndComments />
    </main>
  );
}
