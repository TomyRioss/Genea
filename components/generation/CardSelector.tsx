'use client';

interface CardOption {
  id?: string;
  value?: string;
  label: string;
  labelFemale?: string;
  labelMale?: string;
  image?: string;
  imageFile?: string;
  imageFileMale?: string;
}

interface CardSelectorProps {
  label: string;
  options: CardOption[];
  selected: string;
  onSelect: (value: string) => void;
  gender?: 'female' | 'male';
  variant?: 'person' | 'landscape';
  showGenderSwitch?: boolean;
  onGenderChange?: (gender: 'female' | 'male') => void;
}

export default function CardSelector({
  label,
  options,
  selected,
  onSelect,
  gender = 'female',
  variant = 'person',
}: CardSelectorProps) {
  const imageClasses =
    variant === 'person'
      ? 'h-32 w-24 md:h-40 md:w-32 object-cover flex-shrink-0'
      : 'h-24 w-36 md:h-32 md:w-44 object-cover flex-shrink-0';

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2 md:gap-3 overflow-x-auto p-3 -mx-1 md:mx-0 md:overflow-visible">
        {options.map(option => {
          const optionId = option.id || option.value || '';
          const optionLabel =
            gender === 'male' && option.labelMale
              ? option.labelMale
              : option.labelFemale || option.label;

          let imageSrc = option.image || '';
          if (option.imageFile) {
            const imageFile =
              gender === 'male' && option.imageFileMale
                ? option.imageFileMale
                : option.imageFile;
            imageSrc =
              gender === 'male'
                ? `/models/male/${imageFile}`
                : `/models/${option.imageFile}`;
          }

          return (
            <button
              key={optionId}
              onClick={() => onSelect(optionId)}
              className={`relative overflow-hidden rounded-xl transition-all flex-shrink-0 ${
                selected === optionId
                  ? 'ring-2 ring-gray-900 ring-offset-2'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={imageSrc}
                alt={optionLabel}
                className={imageClasses}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-2 text-sm font-medium text-white">
                {optionLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
