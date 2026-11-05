import '../../styles/components/common/SectionTitle.scss';

export const SectionTitle = ({ as: Tag = 'h2', className = '', children, style, ...props }) => (
  <Tag {...props} style={{ ...style, fontWeight: 400 }} className={`section-title ${className}`.trim()}>{children}</Tag>
);
