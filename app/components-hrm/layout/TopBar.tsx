import React from 'react';

interface TopBarProps {
  title?: string;
  showDate?: boolean;
}

export default function TopBar({ title, showDate }: TopBarProps) {
  return (
    <header className="flex justify-between items-center sticky top-0 z-40 bg-surface/80 backdrop-blur-md w-full h-20 px-12">
      <div>
        {title && <h1 className="text-2xl font-extrabold font-headline tracking-tight text-on-background">{title}</h1>}
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden lg:flex items-center bg-surface-container-low rounded-full px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
          <input 
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full pl-2 placeholder:text-on-surface-variant/60" 
            placeholder="Search records..." 
            type="text"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="material-symbols-outlined text-on-surface-variant hover:opacity-80 transition-opacity">notifications</button>
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </div>
          <button className="material-symbols-outlined text-on-surface-variant hover:opacity-80 transition-opacity">help_outline</button>
          
          {showDate ? (
            <>
              <div className="h-8 w-[1px] bg-outline-variant opacity-15 mx-2"></div>
              <div className="text-right">
                <p className="text-sm font-bold font-headline text-on-surface">Monday, 12 Oct</p>
                <p className="text-xs text-on-surface-variant">02:45 PM</p>
              </div>
            </>
          ) : (
            <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden ml-2 border border-outline-variant/20">
              <img 
                className="w-full h-full object-cover" 
                alt="User Mini Avatar" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWeRcegyQF8zkSxfwz4il17sgmqBG5GZKgXIJaqtwCBcfx3HP67FuenUOsojwb1We3FhtDMeEg4RLa-UUOSwLc5B47hfstSbCLqFm0ILxLaQ4LwQ2txNGw3P1TTVcwZIJpItEhuS-s-n6eiwMTofPlGxy6F_eG2LYTGeHsmL9hNlJ__HxarrQvL2QH9I9apIgr5aE5MAKY0rpYB_z8pz0h03OytLgs2NJbv1kE4gzJyNm5K9rIfPY8UrSlDAn45bNZEDkQB-IKMA8"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
