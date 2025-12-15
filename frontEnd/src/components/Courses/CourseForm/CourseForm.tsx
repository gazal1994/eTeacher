import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Course, CourseFormData } from '../../../types/models';

type CourseFormProps = {
  course?: Course | null;
  onSubmit: (data: CourseFormData) => Promise<void>;
  onCancel: () => void;
};

export const CourseForm: React.FC<CourseFormProps> = ({
  course,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<CourseFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
      });
    }
  }, [course]);

  const validate = (): boolean => {
    const newErrors: Partial<CourseFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('courseForm.required');
    } else if (formData.title.trim().length < 2) {
      newErrors.title = t('courseForm.required');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('courseForm.required');
    } else if (formData.description.trim().length < 5) {
      newErrors.description = t('courseForm.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof CourseFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
          {t('courseForm.courseName')} *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder={t('courseForm.enterName')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
            errors.title ? 'border-red-500' : 'border-slate-300'
          }`}
          disabled={isSubmitting}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          {t('courseForm.description')} *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder={t('courseForm.enterDescription')}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
            errors.description ? 'border-red-500' : 'border-slate-300'
          }`}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('actions.cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('common.loading') : course ? t('actions.edit') : t('actions.add')}
        </button>
      </div>
    </form>
  );
};
