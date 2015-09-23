<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function indexAction(Request $request)
    {
        return $this->render('AppBundle:default:index.html.twig' );
    }
    
    /**
     * @Route("/gmap/", name="gmap")
     */
    public function gmapAction(Request $request)
    {
        return $this->render('AppBundle:default:gmap.html.twig' );
    }
    
    /**
     * @Route("/osmap/", name="osmap")
     */
    public function osmapAction(Request $request)
    {
        return $this->render('AppBundle:default:osmap.html.twig' );
    }
}
