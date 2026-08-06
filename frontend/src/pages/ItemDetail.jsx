import { useParams, Link } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <section className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Item Detail</h1>
        <p className="mt-2 text-gray-500">
          Coming soon — details for item <code className="rounded bg-gray-200 px-1">{id}</code>
        </p>
        <Link to="/" className="mt-4 inline-block text-orange-600 hover:underline">
          ← Back to board
        </Link>
      </section>
    </main>
  );
}

export default ItemDetail;
