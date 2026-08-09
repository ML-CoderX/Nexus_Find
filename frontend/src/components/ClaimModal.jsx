import { useState, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';


function ClaimModal({ itemId, onSuccess, onCancel }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [claimedBy, setClaimedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);


  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
  }, []);

  const removePhoto = useCallback(() => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);


  const handleSubmit = async () => {

    if (!photoFile) {
      setError('A verification photo is required to claim this item.');
      return;
    }
    if (!claimedBy.trim()) {
      setError('Please enter your name.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {

      const ext = photoFile.name.split('.').pop();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `claims/${uniqueName}`;

      const { error: uploadError } = await supabase.storage
        .from('item-photos')
        .upload(filePath, photoFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        throw new Error(`Photo upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('item-photos')
        .getPublicUrl(filePath);

      const claimproofurl = urlData.publicUrl;


      const { error: updateError } = await supabase
        .from('items')
        .update({
          status: 'claimed',
          claimproofurl,
          claimedby: claimedBy.trim(),
        })
        .eq('id', itemId);

      if (updateError) {
        throw new Error(`Claim update failed: ${updateError.message}`);
      }


      onSuccess({
        status: 'claimed',
        claimproofurl,
        claimedby: claimedBy.trim(),
      });
    } catch (err) {
      console.error('Claim error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-modal-title"
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        { }
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
          <h2 id="claim-modal-title" className="text-lg font-bold text-white">
            📸 Verify Your Claim
          </h2>
          <p className="mt-1 text-sm text-emerald-100">
            Upload a photo as proof that you have this item.
          </p>
        </div>

        { }
        <div className="space-y-5 p-6">
          { }
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Why is this needed?</span>{' '}
              To prevent false claims, we require a photo showing you have the item
              (e.g., the item in your hand, on your desk, etc.).
            </p>
          </div>

          { }
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Proof Photo <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed
                px-6 py-6 transition-colors duration-200
                ${photoPreview
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }`}
            >
              {photoPreview ? (
                <figure className="relative">
                  <img
                    src={photoPreview}
                    alt="Claim proof preview"
                    className="max-h-40 rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center
                      rounded-full bg-red-500 text-xs text-white shadow hover:bg-red-600"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </figure>
              ) : (
                <>
                  <svg className="mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    Take or upload a photo
                  </button>
                  <p className="mt-1 text-xs text-gray-400">PNG, JPG, WEBP up to 5 MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                capture="environment"
                onChange={handlePhotoChange}
                className="sr-only"
                aria-label="Upload claim proof photo"
              />
            </div>
          </div>

          { }
          <div>
            <label htmlFor="claimed-by" className="mb-1 block text-sm font-medium text-gray-700">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              id="claimed-by"
              type="text"
              placeholder="e.g. Jordan Lee"
              value={claimedBy}
              onChange={(e) => { setClaimedBy(e.target.value); setError(null); }}
              className="input-base"
            />
          </div>

          { }
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        { }
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="btn-secondary !py-2 !px-4 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !photoFile || !claimedBy.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg
              bg-emerald-600 px-5 py-2 text-sm font-semibold text-white
              transition-all duration-200 hover:bg-emerald-700
              disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                  aria-hidden="true"
                />
                Verifying…
              </>
            ) : (
              '✓ Submit Claim'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClaimModal;
