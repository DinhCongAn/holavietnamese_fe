import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

function ConfirmDialog({ options, onResolve }) {
  useTextLanguage();
  const panelRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!options) return undefined;
    const previous = document.activeElement;
    const panel = panelRef.current;
    panel?.querySelector('[data-confirm]')?.focus();
    function onKeyDown(event) {
      if (event.key === 'Escape') onResolve(false);
      if (event.key !== 'Tab' || !panel) return;
      const controls = [...panel.querySelectorAll('button:not(:disabled)')];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); previous?.focus?.(); };
  }, [options, onResolve]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {options && <motion.div className="confirm-overlay" role="presentation" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .18 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onResolve(false); }}>
        <motion.section ref={panelRef} className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}
          initial={reduceMotion ? false : { opacity: 0, y: 14, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }} transition={{ duration: reduceMotion ? 0 : .2, ease: [0.22, 1, 0.36, 1] }}>
          <button className="confirm-dialog__close" type="button" aria-label={bilingualLabel("Đóng", "Close")} onClick={() => onResolve(false)}><X size={18}/></button>
          <span className={`confirm-dialog__icon confirm-dialog__icon--${options.tone || 'danger'}`} aria-hidden="true"><AlertTriangle size={22}/></span>
          <div className="confirm-dialog__copy"><h2 id={titleId}><BilingualText>{options.title || 'Xác nhận thao tác'}</BilingualText></h2><p id={descriptionId}><BilingualText>{options.description}</BilingualText></p>{options.details&&<div className="confirm-dialog__details">{options.details}</div>}</div>
          <div className="confirm-dialog__actions">
            <button className="secondary" type="button" onClick={() => onResolve(false)}><BilingualText>{options.cancelLabel || 'Hủy'}</BilingualText></button>
            <button data-confirm className={options.tone === 'warning' ? '' : 'danger'} type="button" onClick={() => onResolve(true)}><BilingualText>{options.confirmLabel || 'Xác nhận'}</BilingualText></button>
          </div>
        </motion.section>
      </motion.div>}
    </AnimatePresence>,
    document.body,
  );
}

export function useConfirmDialog() {
  const [options, setOptions] = useState(null);
  const resolver = useRef(null);
  const confirm = useCallback((nextOptions) => new Promise((resolve) => {
    resolver.current?.(false);
    resolver.current = resolve;
    setOptions(typeof nextOptions === 'string' ? { description: nextOptions } : nextOptions);
  }), []);
  const onResolve = useCallback((result) => {
    resolver.current?.(result);
    resolver.current = null;
    setOptions(null);
  }, []);
  useEffect(() => () => resolver.current?.(false), []);
  return { confirm, confirmationDialog: <ConfirmDialog options={options} onResolve={onResolve}/> };
}
