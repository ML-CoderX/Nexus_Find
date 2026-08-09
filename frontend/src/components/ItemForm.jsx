import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Toast from './Toast';


const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Keys',
  'Cards & IDs',
  'Books',
  'Bags & Wallets',
  'Water Bottles',
  'Other',
];


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-()]{7,15}$/;

function isValidContact(value) {
  return EMAIL_RE.test(value) || PHONE_RE.test(value);
}


function validateForm(data) {
  const errors = {};

  if (!data.type) errors.type = 'Select whether the item was lost or found.';
  if (!data.title.trim()) errors.title = 'Title is required.';
  if (!data.description.trim()) errors.description = 'Description is required.';
  if (!data.category) errors.category = 'Pick a category.';
  if (!data.location.trim()) errors.location = 'Location is required.';
  if (!data.datelostfound) errors.datelostfound = 'Date is required.';
  if (!data.reportername.trim()) errors.reportername = 'Your name is required.';

  if (!data.contactinfo.trim()) {
    errors.contactinfo = 'Contact info is required.';
  } else if (!isValidContact(data.contactinfo.trim())) {
    errors.contactinfo = 'Enter a valid email or phone number.';
  }

  return errors;
}


const EMPTY_FORM = {
  type: '',
  title: '',
  description: '',
  category: '',
  location: '',
  datelostfound: '',
  reportername: '',
  contactinfo: '',
};

function ItemForm({ itemId, initialData, existingImageUrl, onEditSuccess, onCancel }) {
  const isEditMode = Boolean(itemId);

  const [formData, setFormData] = useState(
    initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM,
  );
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(existingImageUrl || null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);


  useEffect(() => {
    if (initialData) {
      setFormData({ ...EMPTY_FORM, ...initialData });
      setPhotoPreview(existingImageUrl || null);
    }
  }, [initialData, existingImageUrl]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleTypeToggle = useCallback((type) => {
    setFormData((prev) => ({ ...prev, type }));
    setErrors((prev) => {
      if (!prev.type) return prev;
      const next = { ...prev };
      delete next.type;
      return next;
    });
  }, []);

  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);

    setPhotoPreview(URL.createObjectURL(file));
  }, []);

  const removePhoto = useCallback(() => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);


  async function uploadPhoto(file) {
    const ext = file.name.split('.').pop();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `uploads/${uniqueName}`;

    const { error } = await supabase.storage
      .from('item-photos')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) throw new Error(`Photo upload failed: ${error.message}`);

    const { data } = supabase.storage
      .from('item-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();


    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstKey = Object.keys(validationErrors)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {

      let imageurl = existingImageUrl || null;
      if (photoFile) {
        imageurl = await uploadPhoto(photoFile);
      } else if (!photoPreview) {

        imageurl = null;
      }

      const payload = {
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location: formData.location.trim(),
        datelostfound: formData.datelostfound,
        imageurl,
        reportername: formData.reportername.trim(),
        contactinfo: formData.contactinfo.trim(),
      };

      if (isEditMode) {

        const { error: updateError } = await supabase
          .from('items')
          .update(payload)
          .eq('id', itemId);

        if (updateError) throw new Error(`Update failed: ${updateError.message}`);

        setToast({ type: 'success', message: 'Item updated successfully!' });


        if (onEditSuccess) onEditSuccess({ ...payload, id: itemId });
      } else {

        const { error: insertError } = await supabase.from('items').insert(payload);

        if (insertError) throw new Error(`Database insert failed: ${insertError.message}`);

        setToast({ type: 'success', message: "Item reported successfully! It\u0027s now on the board." });
        setFormData(EMPTY_FORM);
        removePhoto();
      }
    } catch (err) {
      console.error('Submit error:', err);
      setToast({ type: 'error', message: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const FieldError = ({ name }) => {
    if (!errors[name]) return null;
    return (
      <p className="mt-1 text-xs font-medium text-red-600" role="alert">
        {errors[name]}
      </p>
    );
  };


  return (
    <>
      { }
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto max-w-2xl space-y-8"
      >
        { }
        <fieldset id="field-type">
          <legend className="label-base">What happened?</legend>
          <div className="mt-1 flex gap-3">
            {['lost', 'found'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeToggle(t)}
                className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold capitalize
                  transition-all duration-200
                  ${formData.type === t
                    ? t === 'lost'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                aria-pressed={formData.type === t}
              >
                {t === 'lost' ? '🔍 I Lost Something' : '📦 I Found Something'}
              </button>
            ))}
          </div>
          <FieldError name="type" />
        </fieldset>

        { }
        <div id="field-title">
          <label htmlFor="title" className="label-base">
            Item Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g. Silver MacBook charger"
            value={formData.title}
            onChange={handleChange}
            className={`input-base ${errors.title ? 'input-error' : ''}`}
          />
          <FieldError name="title" />
        </div>

        { }
        <div id="field-description">
          <label htmlFor="description" className="label-base">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Include distinguishing details — color, brand, markings…"
            value={formData.description}
            onChange={handleChange}
            className={`input-base resize-y ${errors.description ? 'input-error' : ''}`}
          />
          <FieldError name="description" />
        </div>

        { }
        <div className="grid gap-6 sm:grid-cols-2">
          <div id="field-category">
            <label htmlFor="category" className="label-base">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`input-base ${errors.category ? 'input-error' : ''}`}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <FieldError name="category" />
          </div>

          <div id="field-location">
            <label htmlFor="location" className="label-base">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="e.g. Library, 2nd floor"
              value={formData.location}
              onChange={handleChange}
              className={`input-base ${errors.location ? 'input-error' : ''}`}
            />
            <FieldError name="location" />
          </div>
        </div>

        { }
        <div id="field-datelostfound">
          <label htmlFor="datelostfound" className="label-base">
            Date Lost / Found <span className="text-red-500">*</span>
          </label>
          <input
            id="datelostfound"
            name="datelostfound"
            type="date"
            value={formData.datelostfound}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={`input-base ${errors.datelostfound ? 'input-error' : ''}`}
          />
          <FieldError name="datelostfound" />
        </div>

        { }
        <div id="field-photo">
          <span className="label-base">Photo (optional)</span>
          <div
            className={`mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed
              px-6 py-8 transition-colors duration-200
              ${photoPreview ? 'border-brand-400 bg-brand-50/30' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}
          >
            {photoPreview ? (
              <figure className="relative">
                <img
                  src={photoPreview}
                  alt="Upload preview"
                  className="max-h-48 rounded-lg object-contain"
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
                <svg className="mb-2 h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm text-gray-500">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    Upload a photo
                  </button>
                  {' '}or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-400">PNG, JPG, WEBP up to 5 MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePhotoChange}
              className="sr-only"
              aria-label="Upload item photo"
            />
          </div>
        </div>

        { }
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Your Information
          </h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <div id="field-reportername">
              <label htmlFor="reportername" className="label-base">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="reportername"
                name="reportername"
                type="text"
                placeholder="e.g. Jordan Lee"
                value={formData.reportername}
                onChange={handleChange}
                className={`input-base ${errors.reportername ? 'input-error' : ''}`}
              />
              <FieldError name="reportername" />
            </div>

            <div id="field-contactinfo">
              <label htmlFor="contactinfo" className="label-base">
                Contact (email or phone) <span className="text-red-500">*</span>
              </label>
              <input
                id="contactinfo"
                name="contactinfo"
                type="text"
                placeholder="e.g. jordan@campus.edu or +1 555-1234"
                value={formData.contactinfo}
                onChange={handleChange}
                className={`input-base ${errors.contactinfo ? 'input-error' : ''}`}
              />
              <FieldError name="contactinfo" />
            </div>
          </div>
        </div>

        { }
        <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
          {isEditMode && onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setFormData(EMPTY_FORM); removePhoto(); setErrors({}); }}
              className="btn-secondary"
              disabled={submitting}
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                {isEditMode ? 'Saving…' : 'Submitting…'}
              </>
            ) : (
              isEditMode ? 'Save Changes' : '+ Post Item'
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default ItemForm;
