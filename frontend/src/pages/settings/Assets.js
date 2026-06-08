import { useNavigate } from 'react-router-dom';

import { useFetch } from "hooks/useFetch";
import DeclarationRenderer from '../../components/DeclarationRenderer';
import Span from '../../components/Span';
import Container, { ContainerRow } from '../../components/containers/Container';
import PATH from '../../config/paths';
import { parseMoneyStringMoney } from '../../utils/parsers';
import { useCatalogs } from '../../hooks/useCatalogs';

const Assets = ({path}) => {
    const navigate = useNavigate();
    const { catalogs } = useCatalogs();

    const getData = useFetch({
        path: "/me/asset",
        method: "GET",
        credentials: "include",
        immediate: true,
    });

    const deleteData = useFetch({
        method: "DELETE",
        credentials: "include",
        immediate: false,
    });
    // console.log(getData.data);
    const AssetsRenderer = ({ assets, loading, error }) => (
        <DeclarationRenderer
            items={assets}
            loading={loading}
            error={error}
            renderHeader={(asset) => (
                <Span className="text-uppercase ibm-plex-mono-regular">
                    {catalogs.assetTypes.find(obj => obj.value === String(asset.assettypeid))?.label}
                </Span>
            )}
            renderDetails={(asset) => (
                <Container>
                    <ContainerRow>
                        <Span className="small">
                            Valor del bien:
                        </Span>
                        <Span className="small text-uppercase">
                            {parseMoneyStringMoney(Number(asset.value))}
                        </Span>
                    </ContainerRow>
                    <ContainerRow>
                        <Span className="small">
                            Porcentaje de pertenencia:
                        </Span>
                        <Span className="small text-uppercase">
                            {Number(asset.ownershippercentage) + "%"}
                        </Span>
                    </ContainerRow>
                </Container>
            )}
            actions={({ loading }) => (
                <button
                    className="btn btn-primary px-3 py-2"
                    onClick={() =>
                        !loading &&
                        navigate(`${PATH.declarations.declaration.build({ declarationType: "bien" })}?redirectTo=${path}`)
                    }
                >
                    <ContainerRow className={loading ? "placeholder-wave" : ""}>
                        <Span className={loading ? "bg-body rounded-pill placeholder col-12" : ""}>
                            {loading ? "cargando" : "Declarar bien"}
                        </Span>
                    </ContainerRow>
                </button>
            )}
            options={[
                { label: "Eliminar", onClick: async ({ item } = {}) => {
                    const res = await deleteData.run({
                        path: `/me/asset/${item.id}`,
                    });
                    if (res?.ok) {
                        await getData.run();
                    }
                } },
            ]}
        />
    );

    return (
        <Container>
            <AssetsRenderer assets={getData.data} loading={getData.loading} error={getData.error} />
        </Container>
    );
};

export default Assets;