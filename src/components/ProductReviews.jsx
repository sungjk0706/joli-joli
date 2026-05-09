import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, X } from 'lucide-react';
import { Button, Card } from './ui/Common';
import { reviewService } from '../services';

const ProductReviews = ({ productId, showAlert, customerPhone, orderId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const [reviewsData, ratingData] = await Promise.all([
        reviewService.getByProductId(productId),
        reviewService.getAverageRating(productId),
      ]);
      setReviews(reviewsData);
      setAverageRating(ratingData);
    } catch (error) {
      console.error('리뷰 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reviewService.create({
        customerName: customerPhone || '익명',
        productId,
        orderId,
        rating: formData.rating,
        comment: formData.comment,
      });
      showAlert('리뷰 등록 ✨', '리뷰가 등록되었습니다.', 'success');
      setShowForm(false);
      setFormData({ rating: 5, comment: '' });
      loadReviews();
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
      showAlert('오류', '리뷰 등록 중 오류가 발생했습니다.', 'error');
    }
  };

  const renderStars = (rating, interactive = false, onRate) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={() => interactive && onRate(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          >
            <Star
              size={interactive ? 28 : 16}
              className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              strokeWidth={star <= rating ? 0 : 2}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare size={24} className="text-brand-pink" />
          상품 리뷰 ({averageRating.count})
        </h3>
        {orderId && (
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => setShowForm(true)}
          >
            리뷰 작성
          </Button>
        )}
      </div>

      {averageRating.count > 0 && (
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-black text-brand-pink">{averageRating.average}</p>
            <p className="text-sm text-gray-500">평점</p>
          </div>
          <div className="flex-1">
            {renderStars(Math.round(averageRating.average))}
            <p className="text-sm text-gray-500 mt-1">{averageRating.count}개의 리뷰</p>
          </div>
        </div>
      )}

      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-lg">리뷰 작성</h4>
            <button
              onClick={() => setShowForm(false)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">별점</label>
              {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">리뷰 내용</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="상품에 대한 솔직한 리뷰를 작성해주세요."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-pink focus:outline-none resize-none"
                rows={4}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 font-bold"
            >
              리뷰 등록
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-bold">아직 리뷰가 없습니다</p>
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    {review.is_verified && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        구매확정
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {review.customer_name?.slice(0, 3)}***
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              {review.comment && (
                <p className="text-gray-700 mt-2">{review.comment}</p>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
