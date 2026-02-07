import { EditableText } from '@/components/EditableComponents';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img src="/logo.png" alt="InterBridge Logo" className="w-10 h-10 mr-2 object-contain" />
            <span className="font-bold text-white">InterBridge Trans & Trade</span>
          </div>
          <EditableText
            id="footer-copyright"
            defaultText={`\u00A9 ${new Date().getFullYear()} InterBridge Trans & Trade. All rights reserved.`}
            element="p"
            className="text-sm"
          />
        </div>
      </div>
    </footer>
  );
}
