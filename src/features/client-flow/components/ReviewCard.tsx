import React, { useState } from 'react';
import { Card, Button, Input, Badge, Space, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined, MessageOutlined } from '@ant-design/icons';
import type { ReviewCardProps } from '../types/clientFlow';

const { TextArea } = Input;

/**
 * ReviewCard - Component for review step cards with actions
 * Provides approval/rejection controls and feedback collection
 */
export const ReviewCard: React.FC<ReviewCardProps> = ({
  title,
  status,
  onApprove,
  onReject,
  onRequestChanges,
  comments = [],
  className = '',
}) => {
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const getStatusColor = () => {
    switch (status.status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'needs_changes': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'needs_changes': return 'Needs Changes';
      default: return 'Pending Review';
    }
  };

  const handleRequestChanges = () => {
    if (feedback.trim()) {
      onRequestChanges(feedback);
      setFeedback('');
      setShowFeedback(false);
    }
  };

  const handleApprove = () => {
    onApprove();
    setShowFeedback(false);
  };

  const handleReject = () => {
    onReject();
    setShowFeedback(false);
  };

  return (
    <Card
      className={`review-card ${className}`}
      title={
        <div className="flex items-center justify-between">
          <span>{title}</span>
          <Badge 
            status={getStatusColor()} 
            text={getStatusText()}
          />
        </div>
      }
      extra={
        comments.length > 0 && (
          <Badge count={comments.length} size="small">
            <MessageOutlined className="text-gray-500" />
          </Badge>
        )
      }
    >
      {/* Review Status Info */}
      {status.status !== 'pending' && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <div><strong>Status:</strong> {getStatusText()}</div>
            {status.reviewedAt && (
              <div><strong>Reviewed:</strong> {new Date(status.reviewedAt).toLocaleString()}</div>
            )}
            {status.reviewerId && (
              <div><strong>Reviewer:</strong> {status.reviewerId}</div>
            )}
            {status.feedback && (
              <div className="mt-2">
                <strong>Feedback:</strong>
                <div className="mt-1 text-gray-700">{status.feedback}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comments Section */}
      {comments.length > 0 && (
        <div className="mb-4">
          <Divider orientation="left" orientationMargin="0">
            <span className="text-sm text-gray-600">Comments ({comments.length})</span>
          </Divider>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="p-2 bg-blue-50 rounded text-sm">
                <div className="font-medium text-blue-900">{comment.author}</div>
                <div className="text-blue-800">{comment.message}</div>
                <div className="text-xs text-blue-600 mt-1">
                  {new Date(comment.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {status.status === 'pending' && (
        <div className="space-y-3">
          <Space size="small" wrap>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 border-green-600"
            >
              Approve
            </Button>
            
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={handleReject}
            >
              Reject
            </Button>
            
            <Button
              icon={<EditOutlined />}
              onClick={() => setShowFeedback(!showFeedback)}
              type={showFeedback ? 'primary' : 'default'}
            >
              Request Changes
            </Button>
          </Space>

          {/* Feedback Input */}
          {showFeedback && (
            <div className="mt-3 space-y-2">
              <TextArea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide specific feedback for changes needed..."
                rows={3}
                maxLength={500}
                showCount
              />
              <Space size="small">
                <Button
                  type="primary"
                  size="small"
                  onClick={handleRequestChanges}
                  disabled={!feedback.trim()}
                >
                  Submit Feedback
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setShowFeedback(false);
                    setFeedback('');
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </div>
          )}
        </div>
      )}

      {/* Re-review Actions for non-pending status */}
      {status.status !== 'pending' && (
        <div className="mt-3">
          <Button
            size="small"
            onClick={() => setShowFeedback(!showFeedback)}
            icon={<MessageOutlined />}
          >
            Add Comment
          </Button>
          
          {showFeedback && (
            <div className="mt-2 space-y-2">
              <TextArea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add additional comments..."
                rows={2}
                maxLength={300}
                showCount
              />
              <Space size="small">
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    if (feedback.trim()) {
                      // This would add a comment without changing status
                      onRequestChanges(feedback);
                      setFeedback('');
                      setShowFeedback(false);
                    }
                  }}
                  disabled={!feedback.trim()}
                >
                  Add Comment
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setShowFeedback(false);
                    setFeedback('');
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
