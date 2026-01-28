export const modelOptions = [
  {
    id: 'rubia',
    labelFemale: 'Rubia',
    labelMale: 'Rubio',
    labelEn: 'blonde',
    imageFile: 'blonde.jpeg',
  },
  {
    id: 'asiatica',
    labelFemale: 'Asiática',
    labelMale: 'Asiático',
    labelEn: 'asian',
    imageFile: 'asian.jpeg',
  },
  {
    id: 'latina',
    labelFemale: 'Latina',
    labelMale: 'Latino',
    labelEn: 'latina',
    imageFile: 'latina.jpeg',
    imageFileMale: 'latino.jpeg',
  },
  {
    id: 'pelirroja',
    labelFemale: 'Pelirroja',
    labelMale: 'Pelirrojo',
    labelEn: 'redhead',
    imageFile: 'redhead.jpeg',
  },
  {
    id: 'afroamericana',
    labelFemale: 'Afroamericana',
    labelMale: 'Afroamericano',
    labelEn: 'african american',
    imageFile: 'afroamerican.jpeg',
  },
];

export const backgroundOptions = [
  { id: 'blanco', label: 'Blanco', labelEn: 'white background', image: '/backgrounds/white.jpg' },
  { id: 'estudio', label: 'Estudio', labelEn: 'professional studio background', image: '/backgrounds/studio.jpeg' },
  { id: 'playa', label: 'Playa', labelEn: 'beach background', image: '/backgrounds/beach.jpeg' },
  { id: 'naturaleza', label: 'Naturaleza', labelEn: 'nature background', image: '/backgrounds/nature.jpeg' },
  { id: 'resort', label: 'Resort', labelEn: 'luxury resort background', image: '/backgrounds/resort.jpeg' },
  { id: 'urbano', label: 'Urbano', labelEn: 'urban city background', image: '/backgrounds/urban.jpeg' },
  { id: 'supermercado', label: 'Supermercado', labelEn: 'supermarket background', image: '/backgrounds/supermercado.jpeg' },
];

export const ageOptions = [
  { value: 'kid', label: 'Niño', image: '/models/age/kid.jpeg' },
  { value: 'young', label: 'Joven', image: '/models/age/young.jpeg' },
  { value: 'adult', label: 'Adulto', image: '/models/age/adult.jpeg' },
];

export const bodyTypeOptions = [
  { value: 'petite', label: 'Petite', image: '/models/talle/petite.jpeg' },
  { value: 'regular', label: 'Regular', image: '/models/talle/regular.jpeg' },
  { value: 'curvy', label: 'Curvy', image: '/models/talle/curvy.jpeg' },
];

export const sizeOptions = [
  { id: '1408*1408', label: 'Cuadrado (1:1)', width: 1408, height: 1408 },
  { id: '1088*1920', label: 'TikTok / Stories (9:16)', width: 1088, height: 1920 },
  { id: '1920*1088', label: 'Desktop (16:9)', width: 1920, height: 1088 },
];

export const generationTips = [
  'Añadí descripciones para mejorar la calidad',
  'Utiliza fotos claras para detectar el tipo de ropa mejor',
  'Podés especificar el material de la ropa en la descripción',
];

export const WHATSAPP_NUMBER = '5491134083140';

export const bodyTypeMap: Record<string, string> = {
  petite: 'short',
  curvy: 'curvy',
};

// Mapeo de pose a archivo en Supabase bucket 'backgrounds'
export const poseToSupabaseFile: Record<string, Record<string, string>> = {
  estudio: {
    parada: 'paradastudio.jpg',
    sentada: 'sentadastudio.jpeg',
    silla: 'sillastudio.jpeg',
    espaldas: 'espaldasstudio.jpeg',
  },
  naturaleza: {
    parada: 'natureparada.jpeg',
    sentada: 'naturesentada.jpeg',
    apoyada: 'natureapoyada.jpeg',
  },
  playa: {
    parada: 'beach.jpeg',
    sentada: 'beachsentada.jpeg',
    espaldas: 'beachespalda.jpeg',
  },
  resort: {
    parada: 'resortparada.jpg',
    sentada: 'resortsentada.jpeg',
    espaldas: 'resortespalda.jpeg',
    selfie: 'resortselfie.jpeg',
    cena: 'resortdinner.jpg',
  },
  urbano: {
    parada: 'urbanparada.jpeg',
    sentada: 'urbansentada.jpg',
    casual: 'urbancasual.jpeg',
    espaldas: 'urbanespalda.jpg',
  },
  supermercado: {
    parada: 'supermercadoparada.jpg',
    sentada: 'supermercadosentada.jpg',
    casual: 'supermercadocasual.jpg',
  },
};

export const posesByBackground: Record<string, { id: string; label: string; labelEn: string; image: string }[]> = {
  blanco: [
    { id: 'parada', label: 'Parada', labelEn: 'standing', image: '/backgrounds/estudio/paradastudio.jpg' },
    { id: 'sentada', label: 'Sentada', labelEn: 'sitting', image: '/backgrounds/estudio/sentadastudio.jpeg' },
    { id: 'silla', label: 'Silla', labelEn: 'sitting on a chair', image: '/backgrounds/estudio/sillastudio.jpeg' },
    { id: 'espaldas', label: 'De espaldas', labelEn: 'back view', image: '/backgrounds/estudio/espaldasstudio.jpeg' },
  ],
  estudio: [
    { id: 'parada', label: 'Parada', labelEn: 'standing', image: '/backgrounds/estudio/paradastudio.jpg' },
    { id: 'sentada', label: 'Sentada', labelEn: 'sitting', image: '/backgrounds/estudio/sentadastudio.jpeg' },
    { id: 'silla', label: 'Silla', labelEn: 'sitting on a chair', image: '/backgrounds/estudio/sillastudio.jpeg' },
    { id: 'espaldas', label: 'De espaldas', labelEn: 'back view', image: '/backgrounds/estudio/espaldasstudio.jpeg' },
  ],
  naturaleza: [
    { id: 'sentada', label: 'Sentada', labelEn: 'sitting', image: '/backgrounds/naturaleza/naturesentada.jpeg' },
    { id: 'parada', label: 'Parada', labelEn: 'standing', image: '/backgrounds/naturaleza/natureparada.jpeg' },
    { id: 'apoyada', label: 'Apoyada', labelEn: 'leaning against a tree', image: '/backgrounds/naturaleza/natureapoyada.jpeg' },
  ],
  playa: [
    { id: 'parada', label: 'Parada', labelEn: 'standing', image: '/backgrounds/playa/beachparada.jpeg' },
    { id: 'sentada', label: 'Sentada', labelEn: 'sitting on the sand', image: '/backgrounds/playa/beachsentada.jpeg' },
    { id: 'espaldas', label: 'De espaldas', labelEn: 'back view', image: '/backgrounds/playa/beachespalda.jpeg' },
  ],
  resort: [
    { id: 'sentada', label: 'Sentada', labelEn: 'sitting', image: '/backgrounds/resort/resortsentada.jpeg' },
    { id: 'parada', label: 'Parada', labelEn: 'standing', image: '/backgrounds/resort/resortparada.jpeg' },
    { id: 'espaldas', label: 'De espaldas', labelEn: 'back view', image: '/backgrounds/resort/resortespalda.jpeg' },
    { id: 'selfie', label: 'Selfie', labelEn: 'taking a selfie', image: '/backgrounds/resort/resortselfie.jpeg' },
    { id: 'cena', label: 'Cena', labelEn: 'sitting at dinner table', image: '/backgrounds/resort/resortdinner.jpeg' },
  ],
  urbano: [
    { id: 'sentada', label: 'Sentada', labelEn: 'sitting', image: '/backgrounds/urbano/urbansentada.jpg' },
    { id: 'parada', label: 'Parada', labelEn: 'standing', image: '/backgrounds/urbano/urbanparada.jpeg' },
    { id: 'casual', label: 'Casual', labelEn: 'casual walking pose', image: '/backgrounds/urbano/urbancasual.jpeg' },
    { id: 'espaldas', label: 'De espaldas', labelEn: 'back view', image: '/backgrounds/urbano/urbanespalda.jpg' },
  ],
  supermercado: [
    { id: 'sentada', label: 'Sentada', labelEn: 'sitting', image: '/backgrounds/supermercado/supermercadosentada.jpeg' },
    { id: 'parada', label: 'Parada', labelEn: 'standing', image: '/backgrounds/supermercado/supermercadoparada.jpeg' },
    { id: 'casual', label: 'Casual', labelEn: 'casual walking pose', image: '/backgrounds/supermercado/supermercadocasual.jpeg' },
  ],
  custom: [
    { id: 'parada', label: 'Parada', labelEn: 'standing', image: '/backgrounds/estudio/paradastudio.jpg' },
    { id: 'sentada', label: 'Sentada', labelEn: 'sitting', image: '/backgrounds/estudio/sentadastudio.jpeg' },
    { id: 'silla', label: 'Silla', labelEn: 'sitting on a chair', image: '/backgrounds/estudio/sillastudio.jpeg' },
    { id: 'espaldas', label: 'De espaldas', labelEn: 'back view', image: '/backgrounds/estudio/espaldasstudio.jpeg' },
  ],
};
