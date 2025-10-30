import { FountainPenCanvas } from '@/components/fountain-pen/fountain-pen-canvas';

export default function FountainPenPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fountain Pen Simulator</h1>
        <p className="text-gray-500 mt-2">
          Experience the art of writing with a virtual fountain pen. Adjust nib size, ink color, and flow to create beautiful calligraphy.
        </p>
      </div>

      <FountainPenCanvas />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Tips for Best Results:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Draw slowly for thicker, more saturated lines</li>
          <li>Quick strokes create thinner, lighter lines</li>
          <li>Higher ink flow creates more bleeding and texture</li>
          <li>Experiment with different nib sizes for various writing styles</li>
        </ul>
      </div>
    </div>
  );
}
