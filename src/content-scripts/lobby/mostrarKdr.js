import { levelColor } from '../../lib/constants';
import { alertaMsg } from '../../lib/messageAlerts';


let title = null;
let kdr = null;
const fetchedKdrs = [];

export const mostrarKdr = mutations => {
  $.each( mutations, async ( _, mutation ) => {
    $( mutation.addedNodes )
      .find( 'div.sala-lineup-player' ).addBack( 'div.sala-lineup-player' )
      .each( ( _, element ) => {
        $ ( 'div.sala-lineup-player' ).css( 'min-height', '190px' );
        if ( $( element ).find( 'div.player-placeholder' ).addBack( 'div.player-placeholder' ).length > 0 ) {
          $( element ).find( 'div.sala-lineup-placeholder' ).css( 'height', '100px' );
          $ ( element ).find( 'div.sala-lineup-imagem' ).css( 'margin-top', '23px' );
        } else {
          title = $( element ).find( 'div.sala-lineup-imagem a[data-jsaction]' ).attr( 'title' );
          if ( $( element ).find( '#gcbooster_kdr' ).length === 0 ) {
            const lobbyId = $ ( element )[0].parentNode.parentNode.parentNode.parentNode.parentNode.id;
            kdr = getKdrFromTitle( title );
            $( element )
              .prepend( $( '<div/>',
                {
                  'id': 'gcbooster_kdr',
                  'css': {
                    'width': '45px',
                    'height': '18px',
                    'display': 'flex',
                    'align-items': 'center',
                    'color': 'white',
                    'font-weight': 'bold',
                    'border-right': 'transparent',
                    'border-left': 'transparent',
                    'background': kdr <= 2 ? '' :
                      'linear-gradient(135deg, rgba(0,255,222,0.8) 0%, rgba(245,255,0,0.8) 30%, rgba(255,145,0,1) 60%, rgba(166,0,255,0.8) 100%)',
                    'background-color': kdr <= 2 ? levelColor[Math.round( kdr * 10 )] + 'cc' : 'initial'
                  }
                } ).addClass( 'draw-orange' )
                .append( $( '<span/>', {
                  'id': 'gcbooster_kdr_span',
                  'gcbooster_kdr_lobby': lobbyId,
                  'text': kdr,
                  'kdr': kdr,
                  'css': { 'width': '100%', 'font-size': '10px' }
                } ) ) );
            $( element ).find( 'div.sala-lineup-player' ).append( '<style>.sala-lineup-player:before{top:15px !important;}</style>' );
          }
        }
      } );
  } );
};


function getKdrFromTitle( title ) {
  const regexp = /KDR:\s+(\d+\.\d+)\s/g;
  return Array.from( title.matchAll( regexp ), m => m[1] )[0];
}
const fetchKdr = async id => {
  const fetchedKdr = fetchedKdrs.find( kdr => kdr.id === id );
  if ( fetchedKdr ) {
    return fetchedKdr.kdr;
  }

  const resposta = await fetch( `https://gamersclub.com.br/api/box/history/${id}` );
  const dadosPartida = await resposta.json();

  const kdr = dadosPartida?.stat[0]?.value;
  fetchedKdrs.push( { id, kdr } );
  return kdr;
};
export const mostrarKdrSala = mutations =>
  mutations.forEach( async mutation => {
    if ( !mutation.addedNodes ) {
      return;
    }
    for ( let i = 0; i < mutation.addedNodes.length; i++ ) {
      const node = mutation.addedNodes[i];
      if ( node.className && ( node.className.includes( 'sidebar-item' ) || node.className.includes( 'sidebar-sala-players' ) ) ) {
        const selectorLink = node.querySelector( 'a' );

        const id = selectorLink.getAttribute( 'href' )?.split( '/' )?.at( -1 );
        const kdr = await fetchKdr( id );

        const searchKdr = parseFloat( kdr ).toFixed( 2 ).toString();

        const colorKrdDefault = searchKdr <= 2 ? '#000' :
          'linear-gradient(135deg, rgba(0,255,222,0.8) 0%, rgba(245,255,0,0.8) 30%, rgba(255,145,0,1) 60%, rgba(166,0,255,0.8) 100%)';
        const colorKdr = searchKdr <= 2 ? levelColor[Math.round( searchKdr * 10 )] : colorKrdDefault;

        const kdrSpan = document.createElement( 'span' );

        $( kdrSpan ).css( {
          backgroundColor: colorKdr,
          padding: '2px 4px',
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 5,
          fontSize: '11px',
          width: '40px',
          textAlign: 'center'
        } ).addClass( 'draw-orange' );

        kdrSpan.innerHTML = searchKdr;
        node.querySelector( '.sidebar-item-meta ' ).append( kdrSpan );

        if ( searchKdr === '0.00' ) { alertaMsg( 'Tem um KDR 0 na sala!' ); }
      }
    }
  } );
