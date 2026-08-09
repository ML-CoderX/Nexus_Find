import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import StatusBadge from '../components/StatusBadge';
import ItemForm from '../components/ItemForm';
import Toast from '../components/Toast';
import ConfirmDialog, { useConfirmDialog } from '../components/ConfirmDialog';
import ClaimModal from '../components/ClaimModal';


const TYPE_STYLES = {
  lost: { label: 'Lost Item', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  found: { label: 'Found Item', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
};


function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}


function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const confirmDialog = useConfirmDialog();
  const deleteDialog = useConfirmDialog();
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);


  const fetchItem = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      setError(
        fetchError.code === 'PGRST116'
          ? 'Item not found. It may have been removed.'
          : fetchError.message,
      );
      setItem(null);
    } else {
      setItem(data);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleReopen = async () => {
    if (!item) return;
    setStatusUpdating(true);

    const { error: updateError } = await supabase
      .from('items')
      .update({ status: 'open', claimproofurl: null, claimedby: null })
      .eq('id', item.id);

    if (updateError) {
      setToast({ type: 'error', message: `Reopen failed: ${updateError.message}` });
    } else {

      setItem((prev) => ({ ...prev, status: 'open', claimproofurl: null, claimedby: null }));
      setToast({ type: 'success', message: 'Item reopened — it\'s back on the board.' });
    }

    setStatusUpdating(false);
    confirmDialog.close();
  };


  const handleClaimSuccess = (updatedData) => {
    setItem((prev) => ({ ...prev, ...updatedData }));
    setIsClaimModalOpen(false);
    setToast({ type: 'success', message: 'Item successfully claimed and verified!' });
  };

  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);

    try {

      if (item.imageurl) {
        const marker = '/item-photos/';
        const markerIndex = item.imageurl.indexOf(marker);
        if (markerIndex !== -1) {
          const filePath = decodeURIComponent(
            item.imageurl.slice(markerIndex + marker.length),
          );

          await supabase.storage.from('item-photos').remove([filePath]);
        }
      }


      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', item.id);

      if (deleteError) {
        throw new Error(`Delete failed: ${deleteError.message}`);
      }


      navigate('/');
    } catch (err) {
      console.error('Delete error:', err);
      setToast({ type: 'error', message: err.message || 'Failed to delete item.' });
      setDeleting(false);
      deleteDialog.close();
    }
  };


  const handleEditSuccess = (updatedFields) => {

    setItem((prev) => ({ ...prev, ...updatedFields }));
    setEditing(false);
  };


  const formInitialData = item
    ? {
      type: item.type,
      title: item.title,
      description: item.description,
      category: item.category,
      location: item.location,
      datelostfound: item.datelostfound,
      reportername: item.reportername,
      contactinfo: item.contactinfo,
    }
    : null;

  const typeStyle = TYPE_STYLES[item?.type] || TYPE_STYLES.lost;


  return (
    <div className="min-h-screen bg-surface">
      { }
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      { }
      {confirmDialog.isOpen && (
        <ConfirmDialog
          title="Reopen this item?"
          message="This will move the item back to 'open' status on the board and remove any claim verification."
          confirmText="Reopen"
          variant="default"
          loading={statusUpdating}
          onConfirm={handleReopen}
          onCancel={confirmDialog.close}
        />
      )}

      { }
      {isClaimModalOpen && (
        <ClaimModal
          itemId={item?.id}
          onSuccess={handleClaimSuccess}
          onCancel={() => setIsClaimModalOpen(false)}
        />
      )}

      { }
      {deleteDialog.isOpen && (
        <ConfirmDialog
          title="Delete this item?"
          message="This action is permanent and cannot be undone. The item and its photo will be removed from the board."
          confirmText="Delete Permanently"
          variant="danger"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={deleteDialog.close}
        />
      )}

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
      <main className="mx-auto max-w-6xl px-6 py-8">

        { }
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <span className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" aria-label="Loading" />
            <p className="text-sm text-gray-500">Loading item details…</p>
          </div>
        )}

        { }
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
            <svg className="mb-4 h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h2 className="text-lg font-bold text-red-800">
              {error.includes('not found') ? 'Item Not Found' : 'Failed to Load Item'}
            </h2>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <div className="mt-6 flex gap-3">
              <Link to="/" className="btn-secondary">Back to Board</Link>
              <button type="button" onClick={fetchItem} className="btn-primary !bg-red-600 hover:bg-red-700">
                Try Again
              </button>
            </div>
          </div>
        )}

        { }
        {!loading && !error && item && (
          editing ? (

            <section>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                  Editing Item
                </p>
                <h1 className="mt-1 text-2xl font-extrabold text-gray-900">
                  {item.title}
                </h1>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
                { }
                <ItemForm
                  itemId={item.id}
                  initialData={formInitialData}
                  existingImageUrl={item.imageurl}
                  onEditSuccess={handleEditSuccess}
                  onCancel={() => setEditing(false)}
                />
              </div>
            </section>
          ) : (

            <article>
              { }
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                    Item Details
                  </p>
                  <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                    {item.title}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="btn-secondary !py-2 !px-4 text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={item.status === 'claimed' ? confirmDialog.open : () => setIsClaimModalOpen(true)}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold
                      transition-all duration-200
                      ${item.status === 'claimed'
                        ? 'border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {item.status === 'claimed' ? '↩ Reopen' : '✓ Mark as Claimed'}
                  </button>
                  <button
                    type="button"
                    onClick={deleteDialog.open}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50
                      px-4 py-2 text-sm font-semibold text-red-600
                      transition-all duration-200 hover:bg-red-100"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-5">
                { }
                <div className="lg:col-span-2">
                  {item.imageurl ? (
                    <figure className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                      <img
                        src={item.imageurl}
                        alt={item.title}
                        className="w-full object-cover"
                      />
                    </figure>
                  ) : (
                    <figure className={`flex h-64 items-center justify-center rounded-2xl border ${typeStyle.border} ${typeStyle.bg}`}>
                      <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                      </svg>
                    </figure>
                  )}
                </div>

                { }
                <div className="lg:col-span-3 space-y-6">
                  { }
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${typeStyle.bg} ${typeStyle.color} ${typeStyle.border} border`}>
                      {typeStyle.label}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>

                  { }
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Description</h3>
                    <p className="text-sm leading-relaxed text-gray-700">{item.description}</p>
                  </div>

                  { }
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoField icon="📂" label="Category" value={item.category} />
                    <InfoField icon="📍" label="Location" value={item.location} />
                    <InfoField icon="📅" label="Date Lost / Found" value={formatDate(item.datelostfound)} />
                    <InfoField icon="🕐" label="Posted" value={formatDate(item.createdat)} />
                  </div>

                  { }
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Reported By
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm" aria-hidden="true">
                          {item.reportername?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.reportername}</p>
                          <p className="text-xs text-gray-400">Reporter</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Contact</p>
                        <p className="text-sm font-medium text-gray-700">{item.contactinfo}</p>
                      </div>
                    </div>
                  </div>

                  { }
                  {item.status === 'claimed' && item.claimproofurl && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                          Claim Verification
                        </h3>
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Verified
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <figure className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-emerald-200 bg-white">
                          <img src={item.claimproofurl} alt="Claim proof" className="h-full w-full object-cover" />
                        </figure>
                        <div>
                          <p className="text-xs text-emerald-600 mb-0.5">Claimed by</p>
                          <p className="text-sm font-semibold text-emerald-900">{item.claimedby || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          )
        )}
      </main>
    </div>
  );
}


function InfoField({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
        <span aria-hidden="true">{icon} </span>{label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-gray-800">{value || '—'}</p>
    </div>
  );
}

export default ItemDetail;
