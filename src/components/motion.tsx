import React, { forwardRef, ReactNode, CSSProperties } from 'react';

// Simple motion replacement components using CSS transitions

type MotionProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  whileHover?: any;
  whileTap?: any;
  drag?: any;
  dragConstraints?: any;
  dragElastic?: any;
  onDragStart?: any;
  onDragEnd?: any;
  onClick?: any;
  onMouseDown?: any;
  onMouseUp?: any;
  onMouseMove?: any;
  onTouchStart?: any;
  onTouchEnd?: any;
  onTouchMove?: any;
  [key: string]: any;
};

const MotionDiv = forwardRef<HTMLDivElement, MotionProps>(({ 
  children, 
  className = '', 
  style = {},
  initial,
  animate,
  exit,
  transition,
  whileHover,
  whileTap,
  drag,
  dragConstraints,
  dragElastic,
  onDragStart,
  onDragEnd,
  layoutId,
  layout,
  ...props 
}, ref) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isTapped, setIsTapped] = React.useState(false);

  // Combine styles with transition
  const combinedStyle: CSSProperties = {
    ...style,
    transition: 'all 0.3s ease-in-out',
  };

  // Apply hover and tap transforms
  if (isHovered && whileHover?.scale) {
    combinedStyle.transform = `scale(${whileHover.scale})`;
  }
  if (isTapped && whileTap?.scale) {
    combinedStyle.transform = `scale(${whileTap.scale})`;
  }

  return (
    <div
      ref={ref}
      className={className}
      style={combinedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsTapped(false);
      }}
      onMouseDown={() => setIsTapped(true)}
      onMouseUp={() => setIsTapped(false)}
      {...props}
    >
      {children}
    </div>
  );
});

MotionDiv.displayName = 'MotionDiv';

const MotionButton = forwardRef<HTMLButtonElement, MotionProps>(({ 
  children, 
  className = '', 
  style = {},
  initial,
  animate,
  exit,
  transition,
  whileHover,
  whileTap,
  layoutId,
  layout,
  ...props 
}, ref) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isTapped, setIsTapped] = React.useState(false);

  const combinedStyle: CSSProperties = {
    ...style,
    transition: 'all 0.3s ease-in-out',
  };

  if (isHovered && whileHover?.scale) {
    combinedStyle.transform = `scale(${whileHover.scale})`;
  }
  if (isTapped && whileTap?.scale) {
    combinedStyle.transform = `scale(${whileTap.scale})`;
  }

  return (
    <button
      ref={ref}
      className={className}
      style={combinedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsTapped(false);
      }}
      onMouseDown={() => setIsTapped(true)}
      onMouseUp={() => setIsTapped(false)}
      {...props}
    >
      {children}
    </button>
  );
});

MotionButton.displayName = 'MotionButton';

// AnimatePresence component
export const AnimatePresence = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

// useMotionValue hook replacement
export const useMotionValue = (initial: number) => {
  const [value, setValue] = React.useState(initial);
  const listeners = React.useRef<((v: number) => void)[]>([]);
  
  const set = React.useCallback((newValue: number) => {
    setValue(newValue);
    listeners.current.forEach(listener => listener(newValue));
  }, []);
  
  return {
    get: () => value,
    set,
    on: (event: string, callback: (v: number) => void) => {
      if (event === 'change') {
        listeners.current.push(callback);
        return () => {
          listeners.current = listeners.current.filter(l => l !== callback);
        };
      }
      return () => {};
    },
  };
};

// useTransform hook replacement
export const useTransform = (value: any, input: number[], output: any[]) => {
  return {
    get: () => output[0],
  };
};

// PanInfo type
export type PanInfo = {
  offset: { x: number; y: number };
  delta: { x: number; y: number };
  velocity: { x: number; y: number };
  point: { x: number; y: number };
};

// Export motion object with component creators
export const motion = {
  div: MotionDiv,
  button: MotionButton,
  span: forwardRef<HTMLSpanElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <span ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </span>
  )),
  p: forwardRef<HTMLParagraphElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <p ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </p>
  )),
  h1: forwardRef<HTMLHeadingElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <h1 ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </h1>
  )),
  h2: forwardRef<HTMLHeadingElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <h2 ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </h2>
  )),
  h3: forwardRef<HTMLHeadingElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <h3 ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </h3>
  )),
  form: forwardRef<HTMLFormElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <form ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </form>
  )),
  ul: forwardRef<HTMLUListElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <ul ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </ul>
  )),
  li: forwardRef<HTMLLIElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <li ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </li>
  )),
  a: forwardRef<HTMLAnchorElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <a ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </a>
  )),
  img: forwardRef<HTMLImageElement, MotionProps>(({ className = '', style = {}, ...props }, ref) => (
    <img ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props} />
  )),
  input: forwardRef<HTMLInputElement, MotionProps>(({ className = '', style = {}, ...props }, ref) => (
    <input ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props} />
  )),
  textarea: forwardRef<HTMLTextAreaElement, MotionProps>(({ className = '', style = {}, ...props }, ref) => (
    <textarea ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props} />
  )),
  select: forwardRef<HTMLSelectElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <select ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </select>
  )),
  label: forwardRef<HTMLLabelElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <label ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </label>
  )),
  table: forwardRef<HTMLTableElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <table ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </table>
  )),
  thead: forwardRef<HTMLTableSectionElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <thead ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </thead>
  )),
  tbody: forwardRef<HTMLTableSectionElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <tbody ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </tbody>
  )),
  tr: forwardRef<HTMLTableRowElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <tr ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </tr>
  )),
  th: forwardRef<HTMLTableCellElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <th ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </th>
  )),
  td: forwardRef<HTMLTableCellElement, MotionProps>(({ children, className = '', style = {}, ...props }, ref) => (
    <td ref={ref} className={className} style={{ transition: 'all 0.3s', ...style }} {...props}>
      {children}
    </td>
  )),
};