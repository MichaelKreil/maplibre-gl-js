import {Uniform1i, Uniform1f, Uniform2f, Uniform3f, UniformMatrix4f} from '../uniform_binding';

import type Context from '../../gl/context';
import type {UniformValues, UniformLocations} from '../uniform_binding';
import type RasterStyleLayer from '../../style/style_layer/raster_style_layer';
import {mat4} from 'gl-matrix';

export type RasterUniformsType = {
    'u_matrix': UniformMatrix4f;
    'u_tl_parent': Uniform2f;
    'u_scale_parent': Uniform1f;
    'u_buffer_scale': Uniform1f;
    'u_fade_t': Uniform1f;
    'u_opacity': Uniform1f;
    'u_image0': Uniform1i;
    'u_image1': Uniform1i;
    'u_limit': Uniform1f;
    'u_width0': Uniform1f;
    'u_width1': Uniform1f;
};

const rasterUniforms = (context: Context, locations: UniformLocations): RasterUniformsType => ({
    'u_matrix': new UniformMatrix4f(context, locations.u_matrix),
    'u_tl_parent': new Uniform2f(context, locations.u_tl_parent),
    'u_scale_parent': new Uniform1f(context, locations.u_scale_parent),
    'u_buffer_scale': new Uniform1f(context, locations.u_buffer_scale),
    'u_fade_t': new Uniform1f(context, locations.u_fade_t),
    'u_opacity': new Uniform1f(context, locations.u_opacity),
    'u_image0': new Uniform1i(context, locations.u_image0),
    'u_image1': new Uniform1i(context, locations.u_image1),
    'u_limit': new Uniform1f(context, locations.u_limit),
    'u_width0': new Uniform1f(context, locations.u_width0),
    'u_width1': new Uniform1f(context, locations.u_width1),
});

const rasterUniformValues = (
    matrix: mat4,
    parentTL: [number, number],
    parentScaleBy: number,
    fade: {
        mix: number;
        opacity: number;
    },
    layer: RasterStyleLayer,
    rasterArguments: any
): UniformValues<RasterUniformsType> => {

    const mercatorSize = 1 / (2 ** rasterArguments.z);
    const mercatorX0 = rasterArguments.x * mercatorSize;
    const mercatorY0 = rasterArguments.y * mercatorSize;
    const mercatorX1 = mercatorX0 + mercatorSize;
    const mercatorY1 = mercatorY0 + mercatorSize;
    const geoX0 = demercatorX(mercatorX0);
    const geoY0 = demercatorY(mercatorY0);
    const geoX1 = demercatorX(mercatorX1);
    const geoY1 = demercatorY(mercatorY1);
    const meterWidth = (geoX1 - geoX0) * 111319;
    const meterWidth0 = meterWidth * Math.cos(geoY0 * Math.PI / 180);
    const meterWidth1 = meterWidth * Math.cos(geoY1 * Math.PI / 180);
    const pixelWidth  =  matrix[0] * 4096 / matrix[15] * rasterArguments.width;

    function demercatorX(v: number) { return v * 360 - 180; }
    function demercatorY(v: number) { return (Math.atan(Math.exp((1 - v * 2) * Math.PI)) * 4 / Math.PI - 1) * 90; }

    const valuePerMeter = layer.paint.get('raster-sdf-width');

    const width0 = valuePerMeter * meterWidth0 / pixelWidth;
    const width1 = valuePerMeter * meterWidth1 / pixelWidth;

    return {
        'u_matrix': matrix,
        'u_tl_parent': parentTL,
        'u_scale_parent': parentScaleBy,
        'u_buffer_scale': 1,
        'u_fade_t': fade.mix,
        'u_opacity': fade.opacity * layer.paint.get('raster-opacity'),
        'u_image0': 0,
        'u_image1': 1,
        'u_limit': layer.paint.get('raster-sdf-limit'),
        'u_width0': width0,
        'u_width1': width1,
    }
};

export {rasterUniforms, rasterUniformValues};
