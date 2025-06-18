
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  // Ensure children is properly rendered - handle different types safely
  const renderChildren = () => {
    // If it's already a valid React element, return as-is
    if (React.isValidElement(children)) {
      return children;
    }
    
    // If it's null, undefined, string, or number, return as-is
    if (children == null || typeof children === 'string' || typeof children === 'number' || typeof children === 'boolean') {
      return children;
    }
    
    // If it's an array, handle each item
    if (Array.isArray(children)) {
      return children.map((child, index) => {
        if (React.isValidElement(child) || typeof child === 'string' || typeof child === 'number') {
          return child;
        }
        return String(child);
      }).join('');
    }
    
    // For objects (including plain objects), convert to string safely
    if (typeof children === 'object') {
      console.error('Badge received object as children - this will cause React errors:', children);
      console.trace('Badge object children trace');
      
      // Handle objects that might have circular references
      try {
        // Try to extract meaningful properties for display
        if (children && typeof children === 'object') {
          // Check if it has common properties we can display
          if ('name' in children) {
            return String(children.name);
          }
          if ('toString' in children && typeof children.toString === 'function') {
            const result = children.toString();
            if (result !== '[object Object]') {
              return result;
            }
          }
        }
        return '[Object]';
      } catch (error) {
        console.warn('Error converting object to string for Badge:', error);
        return '[Object]';
      }
    }
    
    // Fallback for any other type
    return String(children);
  };

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {renderChildren()}
    </div>
  )
}

export { Badge, badgeVariants }
