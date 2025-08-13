import React, { useState } from 'react';

interface Tag {
  id: number;
  name: string;
  created_at: string;
}

interface Book {
  id: number;
  title: string;
  amazon_link: string;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

interface EditBookModalProps {
  book: Book;
  onSave: (updatedBook: { title: string; amazon_link: string; tags: string[] }) => void;
  onCancel: () => void;
}

const EditBookModal: React.FC<EditBookModalProps> = ({ book, onSave, onCancel }) => {
  const [title, setTitle] = useState(book.title);
  const [amazonLink, setAmazonLink] = useState(book.amazon_link);
  const [tags, setTags] = useState(book.tags.map(tag => tag.name).join(', '));
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('タイトルは必須です');
      return;
    }

    if (!amazonLink.trim()) {
      alert('Amazon リンクは必須です');
      return;
    }

    setIsLoading(true);
    
    try {
      const tagList = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await onSave({
        title: title.trim(),
        amazon_link: amazonLink.trim(),
        tags: tagList,
      });
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">書籍を編集</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* タイトル */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              タイトル *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Amazon リンク */}
          <div>
            <label htmlFor="amazonLink" className="block text-sm font-medium text-gray-700 mb-2">
              Amazon リンク *
            </label>
            <input
              type="url"
              id="amazonLink"
              value={amazonLink}
              onChange={(e) => setAmazonLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://amazon.co.jp/..."
              required
            />
          </div>

          {/* タグ */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="タグ1, タグ2, タグ3"
            />
            <p className="text-sm text-gray-500 mt-1">
              カンマ区切りで複数のタグを入力できます
            </p>
          </div>

          {/* ボタン */}
          <div className="flex space-x-3 justify-end pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookModal;