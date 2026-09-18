import clsx from 'clsx';
import styles from './EditorStepper.module.scss';

export const EDITOR_STEPS = [
  { id: 1, label: 'Appearance' },
  { id: 2, label: 'Bingo' },
] as const;

export type EditorStep = (typeof EDITOR_STEPS)[number]['id'];

interface EditorStepperProps {
  step: EditorStep;
  onStepSelect: (step: EditorStep) => void;
}

export const EditorStepper = ({ step, onStepSelect }: EditorStepperProps) => {
  return (
    <ol className={styles.stepper} aria-label="Editor steps">
      {EDITOR_STEPS.map((item, index) => {
        const isCurrent = item.id === step;
        const isDone = item.id < step;

        return (
          <li key={item.id} className={styles.item}>
            {index > 0 ? <span className={styles.line} aria-hidden="true" /> : null}
            <button
              type="button"
              className={clsx(
                styles.step,
                isCurrent && styles.current,
                isDone && styles.done
              )}
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => onStepSelect(item.id)}
            >
              <span className={styles.number}>{item.id}</span>
              <span className={styles.label}>{item.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};
