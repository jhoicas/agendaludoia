import type { AnatomicalObservation } from '../types/painmap.types';

/**
 * Convierte las observaciones anatómicas del estado de la app
 * a un recurso HL7 FHIR (Observation) válido.
 */
export function buildFHIRPainObservationResource(params: {
  patientId: string;
  encounterId?: string;
  observation: AnatomicalObservation;
}) {
  const { patientId, encounterId, observation } = params;

  return {
    resourceType: 'Observation',
    id: `pain-map-${Date.now()}`,
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'exam',
            display: 'Exam',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '72514-3',
          display: 'Pain severity - 0-10 verbal numeric rating [Score] - Reported',
        },
      ],
      text: 'Evaluación de Mapa de Dolor y Biomecánica',
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
    encounter: encounterId ? { reference: `Encounter/${encounterId}` } : undefined,
    effectiveDateTime: new Date().toISOString(),
    component: observation.points.map((point) => {
      // Mapeo de color dinámico
      let colorCategory = 'low';
      if (point.painScoreEVA >= 7) colorCategory = 'high';
      else if (point.painScoreEVA >= 4) colorCategory = 'mid';

      return {
        code: {
          coding: [
            {
              system: 'http://agendaludoia.com/fhir/StructureDefinition/anatomical-region',
              code: point.regionId,
              display: point.regionName,
            },
          ],
        },
        valueQuantity: {
          value: point.painScoreEVA,
          unit: 'score',
          system: 'http://unitsofmeasure.org',
          code: '{score}',
        },
        extension: [
          {
            url: 'http://agendaludoia.com/fhir/StructureDefinition/pain-type',
            valueString: point.painType,
          },
          {
            url: 'http://agendaludoia.com/fhir/StructureDefinition/trigger-point',
            valueBoolean: point.triggerPoint,
          },
          {
            url: 'http://agendaludoia.com/fhir/StructureDefinition/normalized-coordinates',
            extension: [
              { url: 'x', valueDecimal: point.coordinates.x },
              { url: 'y', valueDecimal: point.coordinates.y },
            ],
          },
          {
            url: 'http://agendaludoia.com/fhir/StructureDefinition/view-layer',
            extension: [
              { url: 'view', valueString: observation.view },
              { url: 'layer', valueString: observation.layer },
            ],
          },
          {
            url: 'http://agendaludoia.com/fhir/StructureDefinition/severity-color',
            valueString: colorCategory,
          },
        ],
      };
    }),
  };
}
