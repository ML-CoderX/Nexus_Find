import { Link } from 'react-router-dom';
import ItemForm from '../components/ItemForm';


function ReportItem() {
  return (
    <div className="min-h-screen bg-surface">
      { }
      <header className="bg-navy-900 text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold"
              aria-hidden="true"
            >
              ✦
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-wide">CAMPUS LOST &amp; FOUND</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                Student Affairs · Item Recovery
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="rounded-lg border border-gray-600 px-4 py-2 text-xs font-semibold
              transition-colors hover:bg-gray-800"
          >
            ← Back to Board
          </Link>
        </nav>
      </header>

      { }
      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Report an Item
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Lost or found something?
          </h1>
          <p className="mt-2 max-w-lg text-gray-500">
            Fill out the form below and we'll add it to the board so others can see it.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          <ItemForm />
        </section>
      </main>
    </div>
  );
}

export default ReportItem;
