import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'lms_tour_completed_v2';
const CURRENT_STEP_KEY = 'lms_tour_current_step';

interface OnboardingTourProps {
  run?: boolean;
  onComplete?: () => void;
}

interface TourStep {
  id: number;
  title: string;
  description: string;
  target: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  route: string;
  actionText?: string;
  spotlight?: boolean;
}

const getTourSteps = (t: (key: string) => string): TourStep[] => [
  {
    id: 1,
    title: t('tour.step1.title'),
    description: t('tour.step1.description'),
    target: 'body',
    placement: 'center',
    route: '/courses',
    actionText: t('tour.step1.actionText'),
    spotlight: false,
  },
  {
    id: 2,
    title: t('tour.step2.title'),
    description: t('tour.step2.description'),
    target: '[data-tour="courses-grid"]',
    placement: 'top',
    route: '/courses',
    spotlight: true,
  },
  {
    id: 3,
    title: t('tour.step3.title'),
    description: t('tour.step3.description'),
    target: '[data-tour="action-buttons"]',
    placement: 'bottom',
    route: '/courses',
    spotlight: true,
  },
  {
    id: 4,
    title: t('tour.step4.title'),
    description: t('tour.step4.description'),
    target: '[data-tour="nav-students"]',
    placement: 'bottom',
    route: '/courses',
    spotlight: true,
  },
  {
    id: 5,
    title: t('tour.step5.title'),
    description: t('tour.step5.description'),
    target: '[data-tour="enrolments-section"]',
    placement: 'top',
    route: '/enrolments',
    spotlight: true,
  },
  {
    id: 6,
    title: t('tour.step6.title'),
    description: t('tour.step6.description'),
    target: '[data-tour="nav-reports"]',
    placement: 'bottom',
    route: '/enrolments',
    spotlight: true,
  },
  {
    id: 7,
    title: t('tour.step7.title'),
    description: t('tour.step7.description'),
    target: 'body',
    placement: 'center',
    route: '/courses',
    actionText: t('tour.step7.actionText'),
    spotlight: false,
  },
];

export const OnboardingTour = ({ run: externalRun, onComplete }: OnboardingTourProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const TOUR_STEPS = getTourSteps(t);
  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const progressPercentage = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  // Initialize tour
  useEffect(() => {
    const hasCompleted = localStorage.getItem(STORAGE_KEY) === 'true';
    const savedStep = parseInt(localStorage.getItem(CURRENT_STEP_KEY) || '0');

    if (externalRun !== undefined) {
      setIsActive(externalRun);
      setCurrentStep(0);
      localStorage.removeItem(CURRENT_STEP_KEY);
    } else if (!hasCompleted && location.pathname === '/courses') {
      setTimeout(() => {
        setIsActive(true);
        setCurrentStep(savedStep);
      }, 800);
    }
  }, [externalRun, location.pathname]);

  // Calculate tooltip position
  const calculatePosition = useCallback((element: HTMLElement | null, placement: string) => {
    if (!element) return { top: window.innerHeight / 2, left: window.innerWidth / 2 };

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 420;
    const tooltipHeight = 200;
    const offset = 20;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = rect.top - tooltipHeight - offset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - offset;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + offset;
        break;
      case 'center':
        top = window.innerHeight / 2 - tooltipHeight / 2;
        left = window.innerWidth / 2 - tooltipWidth / 2;
        break;
    }

    // Keep tooltip within viewport
    top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));
    left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));

    return { top, left };
  }, []);

  // Update target element and position
  useEffect(() => {
    if (!isActive || !step) return;

    const updateTarget = () => {
      if (step.target === 'body') {
        setTargetElement(null);
        setTooltipPosition(calculatePosition(null, 'center'));
      } else {
        const element = document.querySelector(step.target) as HTMLElement;
        setTargetElement(element);
        setTooltipPosition(calculatePosition(element, step.placement));
      }
      setIsVisible(true);
    };

    // Wait for navigation and DOM update
    const timer = setTimeout(updateTarget, 300);
    window.addEventListener('resize', updateTarget);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTarget);
    };
  }, [isActive, step, calculatePosition]);

  // Navigate to step route
  useEffect(() => {
    if (isActive && step && location.pathname !== step.route) {
      navigate(step.route);
    }
  }, [isActive, step, location.pathname, navigate]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleComplete();
    } else {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        localStorage.setItem(CURRENT_STEP_KEY, String(currentStep + 1));
      }, 200);
    }
  }, [isLastStep, currentStep]);

  const handleBack = useCallback(() => {
    if (!isFirstStep) {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        localStorage.setItem(CURRENT_STEP_KEY, String(currentStep - 1));
      }, 200);
    }
  }, [isFirstStep, currentStep]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setIsActive(false);
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.removeItem(CURRENT_STEP_KEY);
      navigate('/courses');
      onComplete?.();
    }, 200);
  }, [navigate, onComplete]);

  const handleComplete = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setIsActive(false);
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.removeItem(CURRENT_STEP_KEY);
      navigate('/courses');
      onComplete?.();
    }, 200);
  }, [navigate, onComplete]);

  if (!isActive || !step) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[9998] ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleSkip}
      />

      {/* Spotlight */}
      {step.spotlight && targetElement && (
        <div
          className={`fixed border-4 border-indigo-500 rounded-lg pointer-events-none z-[9999] transition-all duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.offsetWidth + 8,
            height: targetElement.offsetHeight + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tooltip Modal */}
      <div
        className={`fixed z-[10000] transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          width: '420px',
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Progress Bar */}
          <div className="h-1.5 bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span className="font-semibold text-indigo-600">
                    {t('tour.progress.step')} {step.id} {t('tour.progress.of')} {TOUR_STEPS.length}
                  </span>
                  <span>•</span>
                  <span>{Math.round(progressPercentage)}% {t('tour.progress.complete')}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  {step.title}
                </h3>
              </div>
              <button
                onClick={handleSkip}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Skip tour"
              >
                <X size={20} />
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              {/* Back Button */}
              <button
                onClick={handleBack}
                disabled={isFirstStep}
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  isFirstStep
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={16} />
                {t('tour.buttons.back')}
              </button>

              <div className="flex items-center gap-2">
                {/* Skip Button */}
                {!isLastStep && (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {t('tour.buttons.skipTour')}
                  </button>
                )}

                {/* Next/Finish Button */}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isLastStep ? (
                    <>
                      <Check size={18} />
                      {step.actionText || t('tour.buttons.finish')}
                    </>
                  ) : (
                    <>
                      {step.actionText || t('tour.buttons.next')}
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="px-6 pb-5 flex items-center justify-center gap-1.5">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-indigo-500 w-8'
                    : 'bg-gray-200 w-1.5'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// Hook to restart the tour
export const useRestartTour = () => {
  const navigate = useNavigate();

  return useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_STEP_KEY);
    navigate('/courses');
    setTimeout(() => window.location.reload(), 100);
  }, [navigate]);
};
