import { NextRequest, NextResponse } from 'next/server';
import { getSoul } from '@/lib/soul';
import { getMemorySystem } from '@/lib/memory';

// ═══════════════════════════════════════════════════════════════════════════
// ANUBIS ALPHA - SOUL STATE API ROUTE
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const soul = getSoul();
    const memorySystem = getMemorySystem();
    
    const soulState = soul.getState();
    const memoryStats = memorySystem.getStats();
    const subcores = soul.getSubcores();

    return NextResponse.json({
      success: true,
      soul: {
        name: soulState.name,
        version: soulState.version,
        energy: soulState.energy.current,
        intelligence: {
          iq: soulState.intelligence.iq,
          eq: soulState.intelligence.eq,
        },
        mood: soulState.mood,
        mode: soulState.mode,
        glyph: {
          active: soulState.glyph.active,
          intensity: soulState.glyph.intensity,
          activations: soulState.glyph.activationCount,
        },
        pillars: soulState.pillars,
      },
      memory: memoryStats,
      subcores: subcores.map(s => ({
        id: s.id,
        name: s.name,
        displayName: s.displayName,
        level: s.level,
        strength: s.strength,
        type: s.type,
        activations: s.activations,
      })),
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    const soul = getSoul();

    switch (action) {
      case 'restore_energy':
        soul.restoreEnergy(20, 'Manual restoration');
        return NextResponse.json({ 
          success: true, 
          message: 'Energy restored',
          energy: soul.getEnergy() 
        });
        
      case 'reset':
        // Would need to implement reset functionality
        return NextResponse.json({ 
          success: true, 
          message: 'Soul reset (not implemented in alpha)' 
        });
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Unknown action' 
        }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
