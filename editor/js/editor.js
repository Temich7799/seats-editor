(function ($) {

    $.fn.editor = function (openButton, contentArea, url) {

        if (openButton && contentArea) {

            const state = {
                brushes: new Map(),
                selectedBrush: undefined,
            }

            const modal = document.createElement('dialog');
            modal.id = 'editor';

            $(openButton).click(() => {
                $(document.body).append(modal);
                modal.showModal();
            });

            const renderButton = (id = '', content = '', callback) => {

                const button = document.createElement('button');

                button.id = id;
                button.textContent = content;

                if (callback) button.onclick = callback;

                return button;
            }

            const renderCloseButton = (id = '', content = '', callback) => renderButton(id, content, () => {
                try {
                    if (callback) callback();
                    modal.close();
                } catch (error) {
                    throw error;
                }
            });

            const renderBrushButton = (id = '', content = '') => {

                state.brushes.set(id, { isSelected: state.brushes.get(id) })

                const button = renderButton(id, content, function () {

                    state.brushes.forEach((value, key) => {

                        const isSelected = key == this.id;
                        isSelected
                            ? $(`#${key}`).addClass('selected')
                            : $(`#${key}`).removeClass('selected');

                        state.brushes.set(key, {
                            ...value,
                            isSelected,
                        })
                    });

                    state.selectedBrush = id;

                });

                return button;
            }

            const renderContentWrapper = () => {

                const contentWrapper = document.createElement('div');
                const field = $('svg', contentArea).clone();

                contentWrapper.id = 'contentWrapper';

                $(field).appendTo(contentWrapper);

                return contentWrapper;
            }

            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

            const renderContentField = () => {

                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

                svg.setAttribute('viewBox', '0 0 400 320');
                svg.setAttribute('style', 'position: absolute; background-color: #f8f8f8;');
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');
                svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

                svg.append(g);

                return svg;
            }

            const renderCircle = (x, y, r = 15, color = '#ffc846') => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('class', 'new');
                circle.setAttribute('cx', x);
                circle.setAttribute('cy', y);
                circle.setAttribute('r', r);
                circle.setAttribute('fill', color);
                return circle;
            }

            const renderSeatRegular = (x, y) => {
                return renderCircle(x, y)
            }

            const renderSeatVip = (x, y) => {
                return renderCircle(x, y, undefined, 'rgb(255 251 26)')
            }

            const svg = renderContentField();

            const editorField = renderContentWrapper();
            editorField.append(svg);

            const contentWrapper = document.createElement('div');
            contentWrapper.id = 'content';

            $(editorField).clone().appendTo(contentWrapper);
            $(contentArea).append(contentWrapper);

            /*
            const sendDataToServer = (data, type) => {

                if (!url) return;

                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ...data, type }),
                })
                    .then(response => {
                        if (response.ok) return true;
                        else return false;
                    })
                    .catch(error => {
                        console.error('Fetch error:', error);
                        return false;
                    });
            };
            */

            const saveAction = () => {

                const newCircles = $('circle.new', editorField);
                const removedCircles = $('circle.removed', editorField);

                if (newCircles.length || removedCircles.length) {

                    if (newCircles.length > 0) {

                        // const data = [];

                        newCircles.each((index, circle) => {

                            const cx = circle.getAttribute('cx');
                            const cy = circle.getAttribute('cy');

                            console.log(`New circle at (cx: ${cx}, cy: ${cy})`);

                            // data.push({ cx, cy });
                        });

                       /* sendDataToServer(data, 'new').then(res => { res &&*/ newCircles.removeClass('new');/* });*/
                    }

                    if (removedCircles.length > 0) {

                        // const data = [];

                        removedCircles.each((index, circle) => {

                            const cx = circle.getAttribute('cx');
                            const cy = circle.getAttribute('cy');

                            console.log(`Deleted circle at (cx: ${cx}, cy: ${cy})`);

                            // data.push({ cx, cy });
                        });

                        /* sendDataToServer(data, 'new').then(res => { res &&*/ removedCircles.remove();/* });*/
                    }

                    $('svg', contentArea).replaceWith($('svg', editorField).clone());
                }
            }


            const closeAction = () => {
                $('circle.new', editorField).remove();
                $('circle.removed', editorField).removeClass('removed');
            }

            modal.append(renderCloseButton('save', 'Save', saveAction));
            modal.append(renderCloseButton('close', 'Close', closeAction));
            modal.append(renderBrushButton('seatRegular', 'Seat regular'));
            modal.append(renderBrushButton('seatVip', 'Seat VIP'));
            modal.append(renderBrushButton('eraser', 'Eraser'));

            modal.append(editorField);

            const point = svg.createSVGPoint();

            $('svg', editorField).click((e) => {

                if (e.target.nodeName === 'circle') {
                    if (state.selectedBrush === 'eraser') {
                        $(e.target).addClass('removed');
                    }
                    return false;
                } else if (state.selectedBrush !== 'eraser') {

                    point.x = e.clientX;
                    point.y = e.clientY;

                    const { x, y } = point.matrixTransform(svg.getScreenCTM().inverse());

                    switch (state.selectedBrush) {
                        case 'seatRegular':
                            g.append(renderSeatRegular(x, y));
                            break;
                        case 'seatVip':
                            g.append(renderSeatVip(x, y));
                            break;
                    }
                }

            });
        }
        else {
            if (!openButton) throw new Error('openButton argument expects DOM element');
            if (!contentArea) throw new Error('contentArea argument expects DOM element');
        }

        return this;
    };
})(jQuery);